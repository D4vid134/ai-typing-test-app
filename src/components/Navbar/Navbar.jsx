import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.scss";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(AuthContext);

  useEffect(() => {
    console.log(currentUser);
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
        <Link to="/">Fresh Type</Link>
      </div>
      <div className="navbar-menu">
        {!currentUser ? (
          <Link className="menu-item" to="/login">Login</Link>
        ) : (
          <div className="menu-item" onClick={handleLogout}>
            Logout
          </div>
        )}
        {/* Add more links as needed */}
      </div>
    </nav>
  );
};

export default Navbar;
