import React from "react";

import "./Footer.scss";
import Contact from "../Contact/Contact";

const Footer = () => {
  return (
    <section className="footer-container">
      <Contact />
      <div className="link-top">
        <a href="#home">
          <i className="fas fa-arrow-circle-up"></i>
        </a>
      </div>
      <p className="sign-off">
        Living, learning, & leveling up one day at a time.
      </p>
      <div className="social-media-links">
        <a
          href="https://github.com/hyetigran"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-github-square"></i>
        </a>
        <a
          href="https://www.linkedin.com/in/tigranasriyan/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-linkedin"></i>
        </a>
        <a
          href="https://twitter.com/hyetigran"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-twitter-square"></i>
        </a>
      </div>
      <div>
        Handcrafted with <i className="fas fa-coffee" /> by Tig
      </div>
    </section>
  );
};

export default Footer;
