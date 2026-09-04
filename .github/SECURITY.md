# Security Policy

Famouskai reads and writes directly to your local filesystem via the File System Access
Application Programming Interface (API). Because of that, security reports are taken seriously —
a bug here can mean data loss or unintended file access, not just a broken feature.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| Latest `main` / most recent tagged release | ✅ |
| Older tagged releases | ❌ (please upgrade first) |

This project is pre-1.0 and does not yet maintain parallel long-term-support branches. Security
fixes land on `main` and are backported only on a case-by-case basis.

## Reporting a Vulnerability

**Do not open a public Issue for security vulnerabilities.**

Instead, use GitHub's private reporting channel:

1. Go to the [Security tab](../security) of this repository.
2. Click **"Report a vulnerability"** to open a private advisory visible only to the maintainer.

If that's not accessible to you, email hello+famouskai-security-problem@denys.digital directly,
with "SECURITY" included in the subject line.

### What to include

- A description of the vulnerability and its potential impact (e.g., arbitrary file read/write
  outside the intended project directory, cross-site scripting (XSS) in the Markdown preview, a
  Diffskai merge that silently drops data).
- Steps to reproduce, ideally a minimal example.
- The browser/operating system (OS) combination you tested on (relevant for File System Access
  API behavior, which varies by browser).

### What to expect

- Acknowledgment within a reasonable timeframe (this is a solo-maintained project — expect days,
  not hours, but reports are not ignored).
- Coordinated disclosure: please allow time for a fix before any public disclosure. A fix
  timeline will be communicated once the report is triaged.
- Credit in the release notes / `CHANGELOG.md`, unless you prefer to remain anonymous.

## Out of Scope

- Vulnerabilities requiring physical access to an already-compromised machine.
- Issues in third-party dependencies without a demonstrated exploit path through Famouskai itself
  (report those upstream, but feel free to flag them here too).
