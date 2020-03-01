import React from "react";

const ProjectCard = props => {
  const { image, title, tech, description, liveLink, repoLink } = props.project;
  return (
    <div>
      <div>
        <p>{title}</p>
        <p>{tech}</p>
        <p>{description}</p>
        <a href={liveLink}>View Project</a>
        <a href={repoLink}>View Code</a>
      </div>
      <div>
        <img src={image} alt={`${title} logo`} />
      </div>
    </div>
  );
};

export default ProjectCard;
