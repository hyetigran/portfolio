import React, { useState, useEffect } from "react";
import avatar from "../assets/avatar2.png";
import axios from "axios";

import "./Contact.scss";

let initialState = {
  email: "",
  subject: "",
  message: "",
};
const Contact = () => {
  const [form, setForm] = useState(initialState);
  const [serverState, setServerState] = useState({
    submitting: false,
    status: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const validationRules = {
    email: (val) => val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    message: (val) => !!val,
    subject: (val) => !!val,
  };
  const renderFieldError = (field) => {
    if (fieldErrors[field]) {
      return <p className="errorMsg">Please enter a valid {field}.</p>;
    }
  };
  useEffect(() => {
    // Only perform interactive validation after submit
    if (Object.keys(fieldErrors).length > 0) {
      validate();
    }
  }, [form]);
  const validate = () => {
    let errors = {};
    let hasErrors = false;
    for (let key of Object.keys(form)) {
      errors[key] = !validationRules[key](form[key]);
      hasErrors |= errors[key];
    }
    setFieldErrors((prev) => ({ ...prev, ...errors }));
    return !hasErrors;
  };
  const handleChange = (event) => {
    event.persist();
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleServerResponse = (ok, msg) => {
    setServerState({
      submitting: false,
      status: { ok, msg },
    });
    if (ok) {
      setFieldErrors({});
      setForm({
        email: "",
        message: "",
        subject: "",
      });
    }
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
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
        <form onSubmit={handleOnSubmit} noValidate>
          <div className="name-email-input">
            <label>
              Name
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className={fieldErrors.subject ? "error" : ""}
              />
              {renderFieldError("subject")}
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => handleChange(e)}
                className={fieldErrors.email ? "error" : ""}
              />
              {renderFieldError("email")}
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
              className={fieldErrors.message ? "error" : ""}
            />
            {renderFieldError("message")}
          </label>

          <input type="hidden" name="_next" value="https://atigran.com/" />
          <input type="hidden" name="_subject" value={form.subject} />
          <input type="text" name="_gotcha" style={{ display: "none" }} />
          <div className="submit-button">
            <button disabled={serverState.submitting}>
              Send{" "}
              {!fieldErrors.length ? (
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
