
import React, { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Check for existing user session in localStorage
  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, this would be an API call to validate credentials
      // For demo purposes, we'll simulate a successful login for any input
      // with basic validation
      
      if (!email.includes('@')) {
        throw new Error("Invalid email format");
      }
      
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Mock user data - in a real app, this would come from a backend
      const userData = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
      };

      // Save user to localStorage and state
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast.success("Login successful!");
      navigate("/home");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // In a real app, this would be an API call to register the user
      // For demo purposes, we'll simulate a successful registration for any input
      // with basic validation
      
      if (!name.trim()) {
        throw new Error("Name is required");
      }
      
      if (!email.includes('@')) {
        throw new Error("Invalid email format");
      }
      
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Mock user data - in a real app, this would come from a backend
      const userData = {
        id: `user-${Date.now()}`,
        name,
        email,
      };

      // Save user to localStorage and state
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast.success("Registration successful!");
      navigate("/home");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
