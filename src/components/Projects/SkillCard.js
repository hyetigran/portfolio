import React from "react";

const SkillCard = props => {
  const { icon, title, tagline, tech, tools } = props.skill;
  return (
    <div>
      <img src="" alt={icon} />
      <p>{title}</p>
      <p>{tagline}</p>
      <p>Tech Stack:</p>
      <p>{tech}</p>
      <p>Tools</p>
      <p>{tools}</p>
    </div>
  );
};

export default SkillCard;
