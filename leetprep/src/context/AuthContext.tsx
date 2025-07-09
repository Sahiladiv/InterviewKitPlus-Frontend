import React, { createContext, useContext, useState, useEffect } from "react";

export interface AuthContextType {
  user: string | null;
  isAuthenticated: boolean;
  login: () => void;
  logoutUser: () => void;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logoutUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem("username"));

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) setUser(storedUser);
  }, []);

  const login = () => {
    const storedUsername = localStorage.getItem("username");
    setUser(storedUsername);
  };

  const logoutUser = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Optional hook for convenience
export const useAuth = () => useContext(AuthContext);
