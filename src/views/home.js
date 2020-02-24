import React from "react";
import "../App.css";

import Hero from "../components/hero";
import About from "../components/about";
import Projects from "../components/projects";

const home = () => {
  return (
    <section className="home">
      <Hero />
      <About />
      <Projects />
    </section>
    <div>
    </div>
  );
};


export default home;
