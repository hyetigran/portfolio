import React from "react";

import SkillCard from "./SkillCard";
import ProjectCard from "./ProjectCard";
import "./Projects.scss";
import befitImg from "../../assets/projects/befit.png";
import lbtcImg from "../../assets/projects/lbtc.png";
import mapRateImg from "../../assets/projects/coins.png";

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
    techTwo: "PostgreSQL | MongoDB | Knex",
    toolsOne: "JWT | Jest | Postman",
    toolsTwo: "Heroku | Bcrypt | Cors "
  }
];

const projectInfo = [
  {
    image: befitImg,
    title: "BeFit",
    description:
      "An all-in-one fitness tracker that let's you build your own custom workouts, exercise on the fly and monitor your progress.",
    liveLink: "https://theworkouttracker.netlify.com/",
    repoLink: "https://github.com/labseu2-workout-tracker"
  },
  {
    image: lbtcImg,
    title: "Local Bitcoin Clone",
    description:
      "Inspired by local.bitcoin.com, I embarked to recreate the core features of what truly makes p2p exchanges fast and easy.",
    liveLink: "",
    repoLink: "https://github.com/hyetigran/local-bitcoins"
  },
  {
    image: mapRateImg,
    title: "MapRates",
    description:
      "A simple application to find the best rate in Armenia and map exchange locations on a map. Data is scraped daily from Rate.am.",
    liveLink: "https://map-rate.herokuapp.com/",
    repoLink: "https://github.com/hyetigran/map-rate"
  }
];

const Projects = () => {
  return (
    <section className="projects">
      <div className="skill-container">
        {cardInfo.map(skill => (
          <SkillCard skill={skill} />
        ))}
      </div>
      <div>
        <h1 className="projects-title">My Recent Projects</h1>
        <p>Here are just a few projects I've recently worked on. </p>

        <div className="project-container">
          {projectInfo.map(project => (
            <ProjectCard project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
