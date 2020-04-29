import React, { useState } from "react";
import avatar from "../assets/avatar2.png";
import axios from "axios";

import "./Contact.scss";

let initialState = {
  myEmail: "tigran.dev@protonmail.com",
  _replyto: "",
  subject: "",
  message: "",
  blocked: true,
};
const Contact = () => {
  const [form, setForm] = useState(initialState);
  const [serverState, setServerState] = useState({
    submitting: false,
    status: null,
  });
  const handleChange = async (e) => {
    e.preventDefault();
    const { _replyto, subject, message } = form;
    const { name, value } = e.target;

    if (_replyto === "" || subject === "" || message === "") {
      await setForm({ ...form, [name]: value, blocked: true });
    } else {
      await setForm({ ...form, [name]: value, blocked: false });
    }
  };

  const handleServerResponse = (ok, msg) => {
    setServerState({
      submitting: false,
      status: { ok, msg },
    });
    if (ok) {
      setForm({
        _replyto: "",
        message: "",
        subject: "",
      });
    }
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();
    setServerState({ submitting: true });
    axios({
      method: "POST",
      url: `https://formspree.io/maybqkvq`,
      data: form,
    })
      .then((r) => {
        handleServerResponse(true, "Thanks!");
      })
      .catch((r) => {
        handleServerResponse(false, r.response.data.error);
      });
  };

  return (
    <section className="contact-section">
      <div className="contact-top">
        <div className="avatar-container">
          <img src={avatar} alt="avatar" />
        </div>
        <h1>Thanks for taking the time to reach out</h1>
      </div>

      <div className="contact-bottom">
        <form onSubmit={handleOnSubmit}>
          <div className="name-email-input">
            <label>
              Name
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={(e) => handleChange(e)}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="_replyto"
                value={form._replyto}
                onChange={(e) => handleChange(e)}
              />
            </label>
          </div>
          <label>
            Message
            <textarea
              type="textarea"
              name="message"
              value={form.message}
              onChange={(e) => handleChange(e)}
              rows="6"
            />
          </label>

          <input type="hidden" name="_next" value="https://atigran.com/" />
          <input type="hidden" name="_subject" value={form.subject} />
          <input type="text" name="_gotcha" style={{ display: "none" }} />
          <div className="submit-button">
            <button
              className={form.blocked ? `disabled-btn` : ""}
              disabled={form.blocked}
            >
              Send{" "}
              {form.blocked ? (
                <i className="fas fa-lock"></i>
              ) : (
                <i className="fas fa-check-square"></i>
              )}
            </button>
          </div>
          {serverState.status && (
            <p className={!serverState.status.ok ? "errorMsg" : ""}>
              {serverState.status.msg}
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default Contact;
//action="https://formspree.io/maybqkvq" method="POST"
