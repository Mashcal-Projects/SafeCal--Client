import React, { createContext, useState, useEffect, useContext } from "react";
import { loginUser } from "../services/APIservice";
import { useTranslation } from "react-i18next";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setInLocalStorage,
} from "../services/SecureStorage";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

  console.log("AuthProvider initialized");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // Store user data if needed
  const { t } = useTranslation("login");

  useEffect(() => {
    // Load user data from localStorage on page load
    const storedUser = getFromLocalStorage("user");
    const token = getFromLocalStorage("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser)); // Parse and set the user object
      setIsLoggedIn(!!token);
    }
  }, []);

  const login = async (userData) => {
    try {
      const response = await loginUser(userData);
      if (response && response.status === 200) {
        const token = response.data.token;
        const user = response.data.user;
        setInLocalStorage("token", token); // Store token in localStorage
        setInLocalStorage("user", JSON.stringify(user)); // Store user data in localStorage

        setIsLoggedIn(true);
        setUser(user); // Set user data if available
        console.log("isLoggedIn set to :", isLoggedIn);
        console.log("user",user)
      }
    } catch (error) {
      // Handle errors thrown by loginUser
      if (error.response) {
        const rawErrorCode = error.response.data.error || "UNEXPECTED_ERROR";
        const normalizedErrorCode = rawErrorCode
          .toUpperCase()
          .replace(/\s+/g, "_"); // Convert to uppercase and replace spaces with underscores
        throw new Error(t(`errors.${normalizedErrorCode}`)); // Get the localized message
      } else if (error.request) {
        throw new Error(t("errors.NETWORK_ERROR"));
      } else {
        throw new Error(t("errors.UNEXPECTED_ERROR"));
      }
    }
  };

  const logout = () => {
    removeFromLocalStorage("token");
    removeFromLocalStorage("user");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};
