import React from "react";
import "./Navbar.scss";

import logoImg from "../../assets/logo.png";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src={logoImg} atl="logo" />
        <a href="#" />
      </div>
      <div className="nav">
        <a href="#projects">PROJECTS</a>
        <a href="#contact">CONTACT</a>
      </div>
    </nav>
  );
};

export default Navbar;
