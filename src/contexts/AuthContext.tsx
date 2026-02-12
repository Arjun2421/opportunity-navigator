import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type UserRole = 'master' | 'admin' | 'proposal_head' | 'svp' | 'basic';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  assignedGroup?: string; // For SVP: which group they're SVP of
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isMaster: boolean;
  isAdmin: boolean;
  isProposalHead: boolean;
  isSVP: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getAllUsers: () => User[];
  updateUserRole: (userId: string, newRole: UserRole, assignedGroup?: string) => void;
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
    email: 'proposalhead@example.com',
    password: 'ph123',
    user: {
      id: 'user-1',
      email: 'proposalhead@example.com',
      displayName: 'Proposal Head',
      role: 'proposal_head',
    },
  },
  {
    email: 'svp-ges@example.com',
    password: 'svp123',
    user: {
      id: 'user-2',
      email: 'svp-ges@example.com',
      displayName: 'SVP - GES',
      role: 'svp',
      assignedGroup: 'GES',
    },
  },
  {
    email: 'svp-gds@example.com',
    password: 'svp123',
    user: {
      id: 'user-3',
      email: 'svp-gds@example.com',
      displayName: 'SVP - GDS',
      role: 'svp',
      assignedGroup: 'GDS',
    },
  },
  {
    email: 'admin@example.com',
    password: 'admin123',
    user: {
      id: 'user-4',
      email: 'admin@example.com',
      displayName: 'Admin User',
      role: 'admin',
    },
  },
  {
    email: 'user@example.com',
    password: 'user123',
    user: {
      id: 'user-5',
      email: 'user@example.com',
      displayName: 'Basic User',
      role: 'basic',
    },
  },
];

function loadUserRoles(): Record<string, { role: UserRole; assignedGroup?: string }> {
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

function persistUserRoles(roles: Record<string, { role: UserRole; assignedGroup?: string }>) {
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
  const [userRoles, setUserRoles] = useState<Record<string, { role: UserRole; assignedGroup?: string }>>(loadUserRoles);
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
      const customRole = userRoles[foundUser.user.id];
      const userWithRole = customRole 
        ? { ...foundUser.user, role: customRole.role, assignedGroup: customRole.assignedGroup }
        : foundUser.user;
      
      setUser(userWithRole);
      localStorage.setItem('auth_user', JSON.stringify(userWithRole));
      
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
    return DEMO_USERS.map(u => {
      const customRole = userRoles[u.user.id];
      return customRole 
        ? { ...u.user, role: customRole.role, assignedGroup: customRole.assignedGroup }
        : u.user;
    });
  }, [userRoles]);

  const updateUserRole = useCallback((userId: string, newRole: UserRole, assignedGroup?: string) => {
    setUserRoles(prev => {
      const updated = { ...prev, [userId]: { role: newRole, assignedGroup } };
      return updated;
    });

    setAllUsers(prev => {
      const updated = prev.map(u => 
        u.id === userId ? { ...u, role: newRole, assignedGroup } : u
      );
      persistAllUsers(updated);
      return updated;
    });

    setUser(current => {
      if (current && current.id === userId) {
        const updated = { ...current, role: newRole, assignedGroup };
        localStorage.setItem('auth_user', JSON.stringify(updated));
        return updated;
      }
      return current;
    });
  }, []);

  const isAuthenticated = user !== null;
  const isMaster = user?.role === 'master';
  const isAdmin = user?.role === 'admin' || user?.role === 'master';
  const isProposalHead = user?.role === 'proposal_head' || isMaster;
  const isSVP = user?.role === 'svp' || isMaster;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isMaster, 
      isAdmin,
      isProposalHead,
      isSVP,
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
