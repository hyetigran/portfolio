import React from "react";

import SkillCard from "./SkillCard";
import ProjectCard from "./ProjectCard";
import "./Projects.scss";

const cardInfo = [
  {
    icon: <i class="fas fa-code fa-5x"></i>,
    title: "Front-End Developer",
    tagline:
      "I like using React for client-side development in order to bring ideas to life in the browser.",
    techOne: "React | Firebase | Reactstrap",
    techTwo: "Redux | Styled Components | Antd",
    toolsOne: "VS Code | Axios | GitHub",
    toolsTwo: "Lodash | Babel | Webpack"
  },
  {
    icon: <i class="fas fa-server fa-5x"></i>,
    title: "Back-End Developer",
    tagline:
      "For server-side development, I'm comfortable with both node/express and the django ecosystem",
    techOne: "Node | Express | GraphQL | Django",
    techTwo: "PostgreSQL | MongoDB | Sqlite",
    toolsOne: "JWT | Jest | Moment",
    toolsTwo: "Knex | Bcrypt | Cors "
  }
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
