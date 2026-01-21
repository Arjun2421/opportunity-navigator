import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { AccountInfo } from '@azure/msal-browser';
import { loginRequest, isDev } from '@/config/msalConfig';

export type UserRole = 'master' | 'admin' | 'basic';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isDevUser?: boolean; // Flag for development users
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isMaster: boolean;
  isAdmin: boolean;
  login: (email?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => void;
  getAllUsers: () => User[];
  updateUserRole: (userId: string, newRole: UserRole) => void;
  isDevMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Master user email - this user always has master role
const MASTER_EMAIL = 'master@example.com';

// Development demo users (only available in dev mode)
const DEV_USERS: { email: string; password: string; user: User }[] = [
  {
    email: 'master@example.com',
    password: 'master123',
    user: {
      id: 'dev-0',
      email: 'master@example.com',
      displayName: 'Master User (Dev)',
      role: 'master',
      isDevUser: true,
    },
  },
  {
    email: 'admin@example.com',
    password: 'admin123',
    user: {
      id: 'dev-1',
      email: 'admin@example.com',
      displayName: 'Admin User (Dev)',
      role: 'admin',
      isDevUser: true,
    },
  },
  {
    email: 'user@example.com',
    password: 'user123',
    user: {
      id: 'dev-2',
      email: 'user@example.com',
      displayName: 'Basic User (Dev)',
      role: 'basic',
      isDevUser: true,
    },
  },
];

function loadUserRoles(): Record<string, UserRole> {
  const saved = localStorage.getItem('user_roles');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  }
  return {};
}

function persistUserRoles(roles: Record<string, UserRole>) {
  localStorage.setItem('user_roles', JSON.stringify(roles));
}

function loadAllUsers(): User[] {
  const saved = localStorage.getItem('all_users');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

function persistAllUsers(users: User[]) {
  localStorage.setItem('all_users', JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { instance, accounts } = useMsal();
  const isMsalAuthenticated = useIsAuthenticated();
  
  const [userRoles, setUserRoles] = useState<Record<string, UserRole>>(loadUserRoles);
  const [allUsers, setAllUsers] = useState<User[]>(loadAllUsers);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Sync MSAL account to user state
  useEffect(() => {
    if (isMsalAuthenticated && accounts.length > 0) {
      const account = accounts[0];
      const email = account.username?.toLowerCase() || '';
      const userId = account.localAccountId || account.homeAccountId || email;
      
      // Determine role: check if master email or use stored role
      let role: UserRole = 'basic';
      if (email === MASTER_EMAIL.toLowerCase()) {
        role = 'master';
      } else if (userRoles[userId]) {
        role = userRoles[userId];
      }

      const msalUser: User = {
        id: userId,
        email: email,
        displayName: account.name || email,
        role: role,
        isDevUser: false,
      };

      setUser(msalUser);
      localStorage.setItem('auth_user', JSON.stringify(msalUser));

      // Add to all users if not exists
      setAllUsers(prev => {
        const exists = prev.some(u => u.id === msalUser.id);
        if (!exists) {
          const updated = [...prev, msalUser];
          persistAllUsers(updated);
          return updated;
        }
        return prev;
      });
    }
  }, [isMsalAuthenticated, accounts, userRoles]);

  useEffect(() => {
    persistUserRoles(userRoles);
  }, [userRoles]);

  const loginWithMicrosoft = useCallback(async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error('Microsoft login failed:', error);
      throw error;
    }
  }, [instance]);

  // Dev login for testing
  const login = useCallback(async (email?: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!isDev) {
      return { success: false, error: 'Development login not available in production' };
    }

    if (!email || !password) {
      return { success: false, error: 'Email and password required' };
    }

    const foundUser = DEV_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      setUser(foundUser.user);
      localStorage.setItem('auth_user', JSON.stringify(foundUser.user));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  }, []);

  const logout = useCallback(() => {
    const currentUser = user;
    setUser(null);
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('adminAuthenticated');

    // If it was an MSAL user, also logout from Microsoft
    if (currentUser && !currentUser.isDevUser && isMsalAuthenticated) {
      instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin + '/login',
      }).catch(console.error);
    }
  }, [user, instance, isMsalAuthenticated]);

  const getAllUsers = useCallback((): User[] => {
    // Combine dev users (in dev mode) with OAuth users
    if (isDev) {
      const devUsers = DEV_USERS.map(u => u.user);
      const oauthUsers = allUsers.filter(u => !u.isDevUser);
      return [...devUsers, ...oauthUsers];
    }
    return allUsers;
  }, [allUsers]);

  const updateUserRole = useCallback((userId: string, newRole: UserRole) => {
    // Update the roles map
    setUserRoles(prev => {
      const updated = { ...prev, [userId]: newRole };
      return updated;
    });

    // Update all users list
    setAllUsers(prev => {
      const updated = prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      );
      persistAllUsers(updated);
      return updated;
    });

    // If the current user's role was changed, update them too
    setUser(current => {
      if (current && current.id === userId) {
        const updated = { ...current, role: newRole };
        localStorage.setItem('auth_user', JSON.stringify(updated));
        return updated;
      }
      return current;
    });
  }, []);

  const isAuthenticated = user !== null;
  const isMaster = user?.role === 'master';
  // Admin now only has approval power, not full admin access
  const isAdmin = user?.role === 'admin' || user?.role === 'master';

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isMaster, 
      isAdmin, 
      login, 
      loginWithMicrosoft,
      logout, 
      getAllUsers, 
      updateUserRole,
      isDevMode: isDev,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
