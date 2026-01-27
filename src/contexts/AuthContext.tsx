import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type UserRole = 'master' | 'admin' | 'basic';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isMaster: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getAllUsers: () => User[];
  updateUserRole: (userId: string, newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for login
const DEMO_USERS: { email: string; password: string; user: User }[] = [
  {
    email: 'master@example.com',
    password: 'master123',
    user: {
      id: 'user-0',
      email: 'master@example.com',
      displayName: 'Master User',
      role: 'master',
    },
  },
  {
    email: 'admin@example.com',
    password: 'admin123',
    user: {
      id: 'user-1',
      email: 'admin@example.com',
      displayName: 'Admin User',
      role: 'admin',
    },
  },
  {
    email: 'user@example.com',
    password: 'user123',
    user: {
      id: 'user-2',
      email: 'user@example.com',
      displayName: 'Basic User',
      role: 'basic',
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

  useEffect(() => {
    persistUserRoles(userRoles);
  }, [userRoles]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) {
      return { success: false, error: 'Email and password required' };
    }

    const foundUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      // Check if role was customized
      const customRole = userRoles[foundUser.user.id];
      const userWithRole = customRole 
        ? { ...foundUser.user, role: customRole }
        : foundUser.user;
      
      setUser(userWithRole);
      localStorage.setItem('auth_user', JSON.stringify(userWithRole));
      
      // Add to all users if not exists
      setAllUsers(prev => {
        const exists = prev.some(u => u.id === userWithRole.id);
        if (!exists) {
          const updated = [...prev, userWithRole];
          persistAllUsers(updated);
          return updated;
        }
        return prev;
      });
      
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  }, [userRoles]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('adminAuthenticated');
  }, []);

  const getAllUsers = useCallback((): User[] => {
    // Return demo users with any role customizations
    return DEMO_USERS.map(u => {
      const customRole = userRoles[u.user.id];
      return customRole ? { ...u.user, role: customRole } : u.user;
    });
  }, [userRoles]);

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
  const isAdmin = user?.role === 'admin' || user?.role === 'master';

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isMaster, 
      isAdmin, 
      login, 
      logout, 
      getAllUsers, 
      updateUserRole,
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
