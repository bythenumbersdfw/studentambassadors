# White-Label Setup Guide

This app is white-label ready. All tenant-specific branding and configuration lives in one file: `public/tenant-config.json`. Each deployment gets its own copy of this file — no code changes required.

---

## Quick Start

1. Copy `public/tenant-config.json`
2. Fill in your tenant's values (see field reference below)
3. Add your logo and favicon to the `public/` folder
4. Deploy

---

## Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `appName` | string | yes | App name shown in the UI heading and browser tab title |
| `logo` | string | yes | Path to logo image (relative to `public/`). Example: `"/logo.png"` |
| `favicon` | string | yes | Path to favicon (relative to `public/`). Example: `"/favicon.ico"` |
| `apiUrl` | string | yes | Base URL for all API requests. Example: `"https://api.acme.com"` |
| `colors` | object | no | CSS variable overrides (see Colors section below) |
| `links.docs` | array | yes | Links shown in the Documentation section |
| `links.social` | array | yes | Links shown in the Connect section |

### Link object shape

```json
{ "label": "GitHub", "href": "https://github.com/your-org", "iconType": "github" }
```

Built-in `iconType` values: `github`, `discord`, `x`, `bluesky`, `vite`, `react`.
For a custom icon, add an SVG symbol to `public/icons.svg` and use its ID as `iconType` (without the `-icon` suffix).

---

## Colors

The `colors` object sets light-mode CSS variables. Keys must match the CSS variable name exactly (include the `--` prefix). The defaults below are the built-in theme — copy and modify as needed.

```json
"colors": {
  "--text": "#6b6375",
  "--text-h": "#08060d",
  "--bg": "#fff",
  "--border": "#e5e4e7",
  "--code-bg": "#f4f3ec",
  "--accent": "#aa3bff",
  "--accent-bg": "rgba(170, 59, 255, 0.1)",
  "--accent-border": "rgba(170, 59, 255, 0.5)",
  "--social-bg": "rgba(244, 243, 236, 0.5)",
  "--shadow": "rgba(0,0,0,0.1) 0 10px 15px -3px, rgba(0,0,0,0.05) 0 4px 6px -2px"
}
```

| Variable | Where it appears |
|----------|-----------------|
| `--text` | Body text |
| `--text-h` | Headings, code text |
| `--bg` | Page background |
| `--border` | Dividers, section borders |
| `--code-bg` | Inline code background |
| `--accent` | Button text, focus rings |
| `--accent-bg` | Button background |
| `--accent-border` | Button hover border |
| `--social-bg` | Social link button background |
| `--shadow` | Hover shadow on social links |

> **Dark mode (fast follow):** Currently dark-mode colors are hardcoded in `src/index.css` and are not tenant-configurable. A future enhancement would add a `colorsDark` object to this config — the `TenantProvider` would listen for `prefers-color-scheme: dark` changes and swap variable sets at runtime. Until then, dark mode inherits the defaults in `src/index.css`.

---

## Logo & Favicon Requirements

| Asset | Recommended format | Recommended size |
|-------|--------------------|------------------|
| Logo | SVG or PNG (transparent bg) | 200×200px minimum |
| Favicon | SVG or ICO | 32×32px |

Place both files in the `public/` folder and reference them with a leading `/` in the config (e.g. `"/logo.svg"`).

---

## API / Database

Set `apiUrl` to your tenant's backend base URL. All API calls in the app use this value. Your backend is responsible for connecting to the correct database — **never put database credentials or secrets in this config file**.

```json
"apiUrl": "https://api.acme.com"
```

Your backend should expect requests from this frontend and handle any tenant-specific routing internally.

---

## What NOT to Put in This File

- Database connection strings
- API keys or secrets
- Private credentials of any kind

This file is served publicly. Treat it like client-side code — anyone can read it.

---

## Example: Full Config

```json
{
  "appName": "Acme Portal",
  "logo": "/acme-logo.svg",
  "favicon": "/acme-favicon.ico",
  "apiUrl": "https://api.acme.com",
  "colors": {
    "--accent": "#0055FF",
    "--accent-bg": "rgba(0, 85, 255, 0.1)",
    "--accent-border": "rgba(0, 85, 255, 0.4)"
  },
  "links": {
    "docs": [
      { "label": "Acme Docs", "href": "https://docs.acme.com", "iconType": "github" }
    ],
    "social": [
      { "label": "GitHub", "href": "https://github.com/acme", "iconType": "github" },
      { "label": "Discord", "href": "https://discord.gg/acme", "iconType": "discord" }
    ]
  }
}
```
