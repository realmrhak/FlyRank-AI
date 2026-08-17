function Contact() {
  return (
    <div className="page contact">
      <h1>Contact</h1>
      <p className="lede">
        Looking for a Full Stack MERN Developer? I'd like to hear about it.
      </p>

      <div className="contact-grid">
        <a className="contact-item" href="mailto:realmrhak07@gmail.com">
          <span className="contact-label">Email</span>
          <span className="contact-value">realmrhak07@gmail.com</span>
        </a>
        <a className="contact-item" href="https://github.com/realmrhak" target="_blank" rel="noreferrer">
          <span className="contact-label">GitHub</span>
          <span className="contact-value">github.com/realmrhak</span>
        </a>
        <a className="contact-item" href="https://linkedin.com/in/realmrhak" target="_blank" rel="noreferrer">
          <span className="contact-label">LinkedIn</span>
          <span className="contact-value">linkedin.com/in/realmrhak</span>
        </a>
        <a className="contact-item" href="https://calendly.com/realmrhak07" target="_blank" rel="noreferrer">
          <span className="contact-label">Book a Call</span>
          <span className="contact-value">calendly.com/realmrhak07</span>
        </a>
      </div>

      <div className="cta-band">
        <p>Prefer to pick a time directly?</p>
        <a className="btn btn-primary" href="https://calendly.com/realmrhak07" target="_blank" rel="noreferrer">
          Book a Call
        </a>
      </div>
    </div>
  )
}

export default Contact
