import { Link } from 'react-router-dom'
import { projects } from '../data/projects.js'

function Home() {
  const featured = projects[0]
  return (
    <div className="page home">
      <section className="hero">
        <span className="eyebrow">Full Stack MERN Developer · Backend AI Engineer</span>
        <h1>I build full-stack MERN systems that actually ship.</h1>
        <p className="lede">
          Real-time collaboration, multi-role platforms, AI integrations — not just sitting in a repo.
          Currently a Backend AI Engineer Intern at FlyRank AI.
        </p>
        <div className="hero-actions">
          <Link to="/portfolio" className="btn btn-primary">See the work</Link>
          <Link to="/contact" className="btn btn-ghost">Hire Me</Link>
        </div>
      </section>

      <section className="skills-strip">
        {['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'JWT', 'TypeScript'].map((s) => (
          <span key={s} className="skill-chip">{s}</span>
        ))}
      </section>

      <section className="featured">
        <h2>Featured build</h2>
        <div className="card">
          <h3>{featured.name}</h3>
          <p className="tagline">{featured.tagline}</p>
          <p>{featured.problem}</p>
          <Link to="/portfolio" className="card-link">See all projects →</Link>
        </div>
      </section>
    </div>
  )
}

export default Home
