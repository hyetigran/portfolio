import React from "react";

import SkillCard from "./SkillCard";
import ProjectCard from "./ProjectCard";

const cardInfo = [
  { icon: "test", title: "test", tagline: "test", tech: "test", tools: "test" },
  { icon: "t", title: "t", tagline: "t", tech: "t", tools: "t" }
];

const projectInfo = [
  {
    image: "src/assets/projects/befit.png",
    title: "beFit",
    tech: "",
    description:
      "An all-in-one fitness tracker that let's you build your own custom workouts, exercise on the fly and monitor your progress.",
    liveLink: "https://theworkouttracker.netlify.com/",
    repoLink: "https://github.com/labseu2-workout-tracker"
  },
  {
    image: "",
    title: "",
    tech: "",
    description: "",
    liveLink: "",
    repoLink: ""
  },
  {
    image: "",
    title: "",
    tech: "",
    description: "",
    liveLink: "",
    repoLink: ""
  }
];

const Projects = () => {
  return (
    <section className="projects">
      <div className="skillContainer">
        {cardInfo.map(skill => (
          <SkillCard skill={skill} />
        ))}
      </div>
      <div>
        <h1>My Recent Projects</h1>
        {projectInfo.map(project => (
          <ProjectCard project={project} />
        ))}
      </div>
    </section>
  );
};

export default Projects;
