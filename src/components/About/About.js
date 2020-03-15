import React from "react";
import "./About.scss";

const About = () => {
  return (
    <section className="about">
      <div className="about-container">
        <h1 className="about-title">
          Hi, my friends call me Tig. Nice to meet you.
        </h1>
        <h2 className="about-text">
          Since graduating with a degree in finance and working for a big four
          firm, I discovered that I was more interested in creating than
          consulting. Lambda School has given me the essential tools of the web
          and after a year of honing my skills, I'm determined to help you build
          great products together.
        </h2>
      </div>
    </section>
  );
};

export default About;
