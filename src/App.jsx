import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { useTenant } from './TenantContext.jsx'
import './App.css'

const BUILT_IN_LOGOS = {
  vite: viteLogo,
  react: reactLogo,
}

function LinkIcon({ iconType, className }) {
  if (BUILT_IN_LOGOS[iconType]) {
    return <img className={className} src={BUILT_IN_LOGOS[iconType]} alt="" />
  }
  return (
    <svg className={className} role="presentation" aria-hidden="true">
      <use href={`/icons.svg#${iconType}-icon`}></use>
    </svg>
  )
}

function App() {
  const [count, setCount] = useState(0)
  const config = useTenant()

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>{config.appName}</h1>
          <p>
            Edit <code>public/tenant-config.json</code> to configure this deployment
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            {config.links.docs.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  <LinkIcon iconType={link.iconType} className={BUILT_IN_LOGOS[link.iconType] ? 'logo' : 'button-icon'} />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the community</p>
          <ul>
            {config.links.social.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  <LinkIcon iconType={link.iconType} className="button-icon" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
