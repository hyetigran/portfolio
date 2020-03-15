import React from "react";
import "./Navbar.scss";
import { Link, useParams } from "react-router-dom";
import logoImg from "../../assets/logo2.png";

const Navbar = props => {
  let url = props.match.url;
  let isHome = true;
  if (url === "/contact") {
    isHome = false;
  }
  const handleHome = () => {
    props.history.push("/");
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        <a href={isHome ? "#home" : "/"}>
          <img src={logoImg} alt="logo" />
        </a>
      </div>
      {isHome ? (
        <div className="nav">
          <a href="#projects">PROJECTS</a>
          <Link to="/contact">CONTACT</Link>
        </div>
      ) : (
        <div className="nav contact">
          <div onClick={() => handleHome()}>
            <i className="fas fa-window-close"></i>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
