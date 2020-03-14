import React, { useState } from "react";
import { ReactComponent as MailSVG } from "../../assets/mailBox.svg";

import "./Contact.scss";

let initialState = {
  myEmail: "tigran.asriyan@gmail.com",
  _replyto: "",
  subject: "",
  message: "",
  blocked: true
};
const Contact = () => {
  const [form, setForm] = useState(initialState);

  const handleChange = async e => {
    e.preventDefault();
    const { _replyto, subject, message } = form;
    const { name, value } = e.target;

    await setForm({ [name]: value });

    if ((_replyto, subject, message)) {
      await setForm({ blocked: false });
    }

    if (_replyto === "" || subject === "" || message === "") {
      await setForm({ blocked: true });
    }
  };

  return (
    <section className="contact-container">
      <div className="contact-left">
        <h1>Thanks for taking the time to reach out.</h1>
        <h1> How can I help you today?</h1>
        <MailSVG />
      </div>
      <div className="contact-right">
        <form action="https://formspree.io/maybqkvq" method="POST">
          <label>
            Name
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={e => handleChange(e)}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="_replyto"
              value={form._replyto}
              onChange={e => handleChange(e)}
            />
          </label>
          <label>
            Message
            <input
              type="textarea"
              name="message"
              value={form.message}
              onChange={e => handleChange(e)}
              rows="5"
            />
          </label>

          <input type="hidden" name="_next" value="https://tigran.software/" />
          <input type="hidden" name="_subject" value={form.subject} />
          <input type="text" name="_gotcha" style={{ display: "none" }} />
          <button className={form.blocked ? `disabled-btn` : ""}>
            <input />
            Send{" "}
            {form.blocked ? (
              <i class="fas fa-lock"></i>
            ) : (
              <i class="fas fa-check-square"></i>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
