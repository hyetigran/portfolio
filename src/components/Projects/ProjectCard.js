import React from "react";

const ProjectCard = props => {
  const { image, title, description, liveLink, repoLink } = props.project;

  let extraStyle = "";
  if (title === "Local Bitcoin Clone") {
    extraStyle = "lbtc";
  }
  return (
    <figure className="project-card">
      <img className={extraStyle} src={image} alt={`${title} logo`} />
      <figcaption>
        <h1>{title}</h1>
        <p>{description}</p>
        <a href={liveLink} className="view-project" target="_blank">
          View Project
        </a>
        <a href={repoLink} className="code-link" target="_blank">
          <i class="fab fa-github"></i> View Code
        </a>
      </figcaption>
      <div className="overlay"></div>
    </figure>
  );
};

export default ProjectCard;
