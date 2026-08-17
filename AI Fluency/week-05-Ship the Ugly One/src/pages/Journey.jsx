const milestones = [
  {
    when: 'Jan 2026 – Apr 2026',
    title: 'Full Stack Developer Intern — MJ Programmers',
    detail: 'First real team environment. Learned how code review, deployment, and client requirements actually work outside of solo projects.',
  },
  {
    when: 'Nov 2025 – Jun 2026',
    title: 'Five solo full-stack projects shipped',
    detail: 'EduCore ERP, NexNote, Nexora AI, EStudy, and Nexra — built independently to go deep on the MERN stack, from schema design to deployment.',
  },
  {
    when: 'Jun 2026 – Present',
    title: 'Backend AI Engineer Intern — FlyRank AI',
    detail: 'Structured internship curriculum covering AI-assisted workflows, backend engineering, and API design. Currently working through weekly assignments and building this portfolio as part of it.',
  },
  {
    when: 'Ongoing',
    title: 'BCS, GCUF Faisalabad',
    detail: 'Computer Science coursework running alongside internships and solo project work.',
  },
]

function Journey() {
  return (
    <div className="page journey">
      <h1>Journey</h1>
      <p className="lede">How I got from learning the basics to shipping full systems.</p>

      <div className="timeline">
        {milestones.map((m, i) => (
          <div className="timeline-item" key={i}>
            <div className="timeline-marker" />
            <div className="timeline-content">
              <span className="timeline-when">{m.when}</span>
              <h3>{m.title}</h3>
              <p>{m.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="cta-band">
        <p>This space grows — capstone work and future write-ups land here next.</p>
      </div>
    </div>
  )
}

export default Journey
