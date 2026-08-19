import { useState } from 'react'

const FORM_ENDPOINT = 'https://formspree.io/f/mjybpkln'

function Contact() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(e.target),
      })
      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', email: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

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

      <div className="form-card">
        <h2>Send a message</h2>

        {status === 'sent' ? (
          <p className="form-success">
            Thanks — your message just landed in my inbox. I'll get back to you soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>
            <div className="form-row">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
              />
            </div>
            <div className="form-row">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="What are you looking to build?"
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>

            {status === 'error' && (
              <p className="form-error">Something went wrong — try again, or email me directly.</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default Contact
