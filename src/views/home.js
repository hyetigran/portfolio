import React from "react";

import Hero from "../components/Hero/Hero";
import About from "../components/About/About";
import Projects from "../components/Projects/Projects";
import Contact from "../components/Contact/Contact";

const Home = () => {
  return (
    <section className="home">
      <Hero />
      <About />
      <Projects />
    </section>
  );
};

export default Home;
