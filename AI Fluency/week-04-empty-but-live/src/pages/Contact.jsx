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
      </div>

      <div className="cta-band">
        <p>One click, no form to fill.</p>
        <a className="btn btn-primary" href="mailto:realmrhak07@gmail.com?subject=Hire%20Me%20—%20Full%20Stack%20MERN%20Developer">
          Hire Me
        </a>
      </div>
    </div>
  )
}

export default Contact
