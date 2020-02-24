import React from "react";
import "./components.css";

const cardInfo = [
  { icon: "test", title: "test", tagline: "test", tech: "test", tools: "test" },
  { icon: "", title: "", tagline: "", tech: "", tools: "" }
];

const projects = () => {
  return (
    <section className="projects">
      <div>
        {cardInfo.map(card => {
          return (
            <div>
              <div></div>
              <div></div>
              <div></div>
              
              <div></div>
              <img src="" alt={card.icon} />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default projects;
