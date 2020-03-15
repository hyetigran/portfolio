import React from "react";
import { Link } from "react-router-dom";
import "./Contact.scss";

const Contact = () => {
  return (
    <section className="contact-container">
      <div>Get in touch</div>
      <div>
        <p>Are you a potenial employer? Have an interesting idea?</p>
        <p>Feel free to send a message</p>
      </div>
      <div>
        <Link to="/contact">Let's do this</Link>
      </div>
    </section>
  );
};

export default Contact;
