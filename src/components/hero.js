import React from "react";
import "./components.css";

import { ReactComponent as DeskSVG } from "../assets/desk.svg";

const hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <h1>Full Stack Developer & Code Explorer</h1>
        <h2>I pursue bold ideas and bring them to life through code.</h2>
        <div>Avatar image</div>
        <DeskSVG />
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </section>
  );
};

export default hero;
