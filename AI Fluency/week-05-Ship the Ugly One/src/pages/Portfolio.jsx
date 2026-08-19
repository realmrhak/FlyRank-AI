import { projects } from '../data/projects.js'

function Portfolio() {
  return (
    <div className="page portfolio">
      <h1>Portfolio</h1>
      <p className="lede">Five solo full-stack builds, strongest first.</p>

      <div className="project-list">
        {projects.map((p) => (
          <article className="project-card" key={p.slug} id={p.slug}>
            <div className="project-head">
              <h2>{p.name}</h2>
              <span className="project-tagline">{p.tagline}</span>
            </div>

            <div className="stack-row">
              {p.stack.map((s) => (
                <span key={s} className="stack-chip">{s}</span>
              ))}
            </div>

            <div className="project-body">
              <div>
                <h4>Problem</h4>
                <p>{p.problem}</p>
              </div>
              <div>
                <h4>What I built</h4>
                <p>{p.build}</p>
              </div>
              <div>
                <h4>Hardest part</h4>
                <p>{p.hard}</p>
              </div>
            </div>

            <p className="project-result">{p.result}</p>
            <a className="project-repo-link" href={p.repo} target="_blank" rel="noreferrer">
              View code on GitHub →
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Portfolio
