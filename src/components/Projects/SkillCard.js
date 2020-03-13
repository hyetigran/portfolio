import React from "react";

import "./Projects.scss";

const SkillCard = props => {
  const {
    icon,
    title,
    tagline,
    techOne,
    techTwo,
    toolsOne,
    toolsTwo
  } = props.skill;
  return (
    <div className="skillCard">
      {icon}
      <p className="title">{title}</p>
      <p className="tagline">{tagline}</p>
      <p className="title">Tech Stack:</p>
      <p>{techOne}</p>
      <p>{techTwo}</p>
      <p className="title">Tools:</p>
      <p>{toolsOne}</p>
      <p>{toolsTwo}</p>
    </div>
  );
};

export default SkillCard;
