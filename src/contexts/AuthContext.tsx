
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo users for fallback authentication
const DEMO_USERS = [
  {
    id: 1,
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    role: "admin" as const
  },
  {
    id: 2,
    email: "user@example.com",
    password: "user123",
    name: "Regular User",
    role: "user" as const
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try to fetch from json-server first
      const response = await fetch('http://localhost:5000/users');
      
      if (response.ok) {
        const users = await response.json();
        
        // Find user by email and password
        const foundUser = users.find((u: any) => u.email === email && u.password === password);
        
        if (foundUser) {
          const userData = {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role
          };
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return true;
        }
      }
    } catch (error) {
      console.log('Server not available, using demo authentication');
    }

    // Fallback to demo users if server is not available
    const foundDemoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (foundDemoUser) {
      const userData = {
        id: foundDemoUser.id,
        email: foundDemoUser.email,
        name: foundDemoUser.name,
        role: foundDemoUser.role
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
