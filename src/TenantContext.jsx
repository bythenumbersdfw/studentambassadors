import { createContext, useContext, useEffect, useState } from 'react'

const TenantContext = createContext(null)

export function TenantProvider({ children }) {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    fetch('/tenant-config.json')
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg.colors) {
          Object.entries(cfg.colors).forEach(([key, val]) => {
            document.documentElement.style.setProperty(key, val)
          })
        }

        if (cfg.appName) {
          document.title = cfg.appName
        }

        if (cfg.favicon) {
          const link = document.querySelector("link[rel='icon']")
          if (link) link.href = cfg.favicon
        }

        setConfig(cfg)
      })
  }, [])

  if (!config) return null

  return (
    <TenantContext.Provider value={config}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  return useContext(TenantContext)
}
