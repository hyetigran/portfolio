import React from "react";
import "./Hero.scss";
import avatar from "../../assets/avatar2.png";
import { ReactComponent as DeskSVG } from "../../assets/desk.svg";

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <h1 className="title">Full Stack Developer & Code Explorer</h1>
        <h2 className="sub-title">
          I pursue bold ideas and bring them to life through code.
        </h2>
        <div className="avatar-container">
          <img src={avatar} alt="avatar" />
        </div>
        <div className="desk-container">
          <DeskSVG />
        </div>
      </div>
    </section>
  );
};

export default Hero;
