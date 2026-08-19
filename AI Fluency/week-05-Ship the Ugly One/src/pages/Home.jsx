import { Link } from 'react-router-dom'
import { projects } from '../data/projects.js'

function Home() {
  const featured = projects[0]
  return (
    <div className="page home">
      <section className="hero">
        <span className="eyebrow">Full Stack MERN Developer · Backend AI Engineer</span>
        <h1>I build production-ready MERN + AI systems — backend, APIs, and integrations that actually ship.</h1>
        <p className="lede">
          Role-based access control, real-time sync, authentication, AI-powered features —
          the engineering underneath, not just the UI on top. Currently a Backend AI Engineer
          Intern at FlyRank AI.
        </p>
        <div className="hero-actions">
          <Link to="/portfolio" className="btn btn-primary">See the work</Link>
          <Link to="/contact" className="btn btn-ghost">Hire Me</Link>
        </div>
        <div className="proof-stats">
          <div className="proof-stat">
            <span className="proof-number">5</span>
            <span className="proof-label">Full-Stack Projects Shipped</span>
          </div>
          <div className="proof-stat">
            <span className="proof-number">2</span>
            <span className="proof-label">Internships</span>
          </div>
          <div className="proof-stat">
            <span className="proof-number">6</span>
            <span className="proof-label">User Roles Built (RBAC, EduCore ERP)</span>
          </div>
        </div>
      </section>

      <section className="skills-strip">
        <span className="skills-strip-label">Backend focus:</span>
        {['REST APIs', 'JWT Auth', 'RBAC', 'MongoDB Schema Design', 'Socket.io', 'AI API Integration'].map((s) => (
          <span key={s} className="skill-chip">{s}</span>
        ))}
      </section>

      <section className="featured">
        <h2>Featured build</h2>
        <div className="card">
          <h3>{featured.name}</h3>
          <p className="tagline">{featured.tagline}</p>
          <p>{featured.problem}</p>
          <p className="card-build">{featured.build}</p>
          <Link to="/portfolio" className="card-link">See all projects →</Link>
        </div>
      </section>
    </div>
  )
}

export default Home
