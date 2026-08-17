import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/journey', label: 'Journey' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/contact', label: 'Contact' },
]

function App() {
  return (
    <div className="site">
      <header className="site-header">
        <NavLink to="/" className="brand">
          <span className="brand-badge">HK</span>
          <span className="brand-name">Haroon Ameer Khan</span>
        </NavLink>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/contact" className="nav-cta">Hire Me</NavLink>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>© 2026 Haroon Ameer Khan · Built with React + Vite</p>
        <div className="footer-links">
          <a href="https://github.com/realmrhak" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/realmrhak" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="mailto:realmrhak07@gmail.com">Email</a>
        </div>
      </footer>
    </div>
  )
}

export default App
