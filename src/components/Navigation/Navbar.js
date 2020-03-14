import React from "react";
import "./Navbar.scss";
import { Link } from "react-router-dom";
import logoImg from "../../assets/logo2.png";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src={logoImg} atl="logo" />
        <a href="#" />
      </div>
      <div className="nav">
        <a href="#projects">PROJECTS</a>
        <Link to="/contact">CONTACT</Link>
      </div>
    </nav>
  );
};

export default Navbar;
