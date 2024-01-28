import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.scss";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../App";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
  }, [currentUser]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        dispatch({ type: "LOGOUT" }); // Dispatching logout action
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link className="title" to="/">Fresh Type</Link>
      </div>
      <div className="navbar-menu">
        {/* {!currentUser ? (
          <Link className="menu-item" to="/login">Login</Link>
        ) : (
          <div className="menu-item" onClick={handleLogout}>
            Logout
          </div>
        )} */}
        {theme === "dark" ? (
          <div className="dark-mode-toggle" onClick={toggleTheme}>
            <LightModeIcon />
          </div>
        ) : (
          <div className="dark-mode-toggle" onClick={toggleTheme}>
            <DarkModeIcon />
          </div>
        )}
        <Link className="menu-item" to="/">Home</Link>
        <Link className="menu-item" to="/about">About</Link>
        {/* Add more links as needed */}
      </div>
    </nav>
  );
};

export default Navbar;
