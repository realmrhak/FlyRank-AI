import { Link } from 'react-router-dom'

function About() {
  return (
    <div className="page about">
      <h1>About</h1>
      <p className="lede">
        I'm a Full Stack MERN Developer based in Lahore, currently completing a BCS at GCUF Faisalabad
        and working as a Backend AI Engineer Intern at FlyRank AI.
      </p>

      <div className="two-col">
        <div>
          <h2>How I work</h2>
          <p>
            For big solo builds, I move fast and iterate — sketch the structure, get something working end
            to end, then tighten it. For backend and auth work, I slow down and get methodical, because
            that's the part that breaks quietly if you rush it.
          </p>
          <p>
            I've also spent time on the other side of the code — writing technical explainers on React,
            JWT, REST APIs, and TypeScript, which keeps me honest about actually understanding something
            versus just being able to use it.
          </p>
        </div>
        <div>
          <h2>Skills</h2>
          <ul className="skill-list">
            <li><strong>Frontend:</strong> React, Redux, Context API, Tailwind CSS</li>
            <li><strong>Backend:</strong> Node.js, Express, REST API design</li>
            <li><strong>Database:</strong> MongoDB, schema design</li>
            <li><strong>Auth:</strong> JWT, refresh-token rotation, RBAC</li>
            <li><strong>Realtime:</strong> Socket.io</li>
            <li><strong>Other:</strong> TypeScript, Git, Vercel/Render deployment</li>
          </ul>
        </div>
      </div>

      <div className="cta-band">
        <p>Resume PDF coming soon — for now, see the live projects.</p>
        <Link className="btn btn-primary" to="/portfolio">See Projects</Link>
      </div>

      <p className="next-link">
        <Link to="/journey">Read the full journey →</Link>
      </p>
    </div>
  )
}

export default About
