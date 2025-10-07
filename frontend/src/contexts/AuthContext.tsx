import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: {
    phone_number?: string;
    bio?: string;
    location?: string;
    is_verified: boolean;
    profile_photo?: string;
  };
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    referral_code?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfilePhoto: (photoUrl: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const { user: currentUser } = await authService.getCurrentUser();
        if (currentUser) {
          setUser({
            ...currentUser,
            isAuthenticated: true
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await authService.login({ username, password });
      if (result.user) {
        setUser({
          ...result.user,
          isAuthenticated: true
        });
        return { success: true };
      } else {
        const errorMessage = result.error || 'Login failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    referral_code?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    setIsLoading(true);
    
    try {
      const result = await authService.register(userData);
      if (result.user) {
        setUser({
          ...result.user,
          isAuthenticated: true
        });
        return { success: true };
      } else {
        const errorMessage = result.error || 'Registration failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const updateProfilePhoto = async (photoUrl: string): Promise<void> => {
    if (user) {
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          profile_photo: photoUrl
        }
      };
      setUser(updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    updateProfilePhoto,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;