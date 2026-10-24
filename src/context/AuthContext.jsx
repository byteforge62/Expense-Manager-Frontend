import React, { useState, useContext, createContext,useMemo } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token:v1");
    return storedToken && storedToken !== "undefined" ? storedToken : null;
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user:v1");
    if (storedUser && storedUser !== "undefined") {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("token:v1");
        localStorage.removeItem("user:v1");
        return null;
      }
    }
    return null;
  });

  const [loading] = useState(false);

 // Import useCallback at the top if not present, otherwise we're leveraging React's core hooks
  const login = React.useCallback((loginResponse) => {
    const { token, data } = loginResponse;

    localStorage.setItem("token:v1", token);
    localStorage.setItem("user:v1", JSON.stringify(data));

    setToken(token);
    setUser(data);

    if (data.role === "Admin") {
      navigate("/admin/admindashboard");
    } else {
      navigate("/private/userdashboard");
    }
  }, [navigate]);

  const updateUser = React.useCallback((updatedData) => {
    setUser((currentUser) => {
      const merged = { ...currentUser, ...updatedData };
      localStorage.setItem("user:v1", JSON.stringify(merged));
      return merged;
    });
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem("token:v1");
    localStorage.removeItem("user:v1");

    setToken(null);
    setUser(null);

    navigate("/login");
  }, [navigate]);

  // Now dependencies are completely stable reference pipelines
  const authValue = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    updateUser
  }), [user, token, loading, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
