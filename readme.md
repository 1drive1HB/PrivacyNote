# PrivacyNote

Live application: https://1drive1hb.github.io/PrivacyNote/

PrivacyNote is a secure, one-time note sharing application with client-side encryption and a zero-knowledge design. Notes are encrypted in the browser, and the server never receives plaintext. Each note is deleted after the first successful read.

## Security features

| Feature | Implementation |
|---------|----------------|
| Encryption | AES-256-GCM with PBKDF2 key derivation (\(100{,}000\) iterations) |
| Architecture | Zero-knowledge (server does not access plaintext) |
| One-time access | Automatic deletion after first read |
| Input validation | Sanitization and pattern-based filtering to reduce injection risk |
| Rate limiting | Client-side limit of 5 notes per minute |
| XSS protection | Content Security Policy (CSP) and safe DOM manipulation patterns |
| Database security | Row-level security, CHECK constraints |

Full details: `private/docs/SECURITY.md`

## Key features

- Client-side encryption using the Web Crypto API
- One-time read behavior with server-side deletion after viewing
- Configurable expiration (\(24\) hours or \(48\) hours)
- Responsive UI with dark mode support
- Quick sharing via copy link or WhatsApp
- Bot protection via Cloudflare Turnstile
- No tracking: no cookies, analytics, or personal data collection

## Quick start

### Create a note
1. Open https://1drive1hb.github.io/PrivacyNote/
2. Enter your message (maximum \(8{,}000\) characters)
3. Select encryption and expiration settings
4. Click “Create Secure Note”
5. Share the generated link

### View a note
1. Open the shared link
2. The note is displayed once
3. The note is deleted from the server after read
4. The link becomes invalid

## Security guarantees

### Threats addressed
- Cross-site scripting (XSS)
- SQL injection (through validation and database constraints)
- JavaScript/code injection patterns
- CSRF protections (where applicable to the flow)
- Clickjacking mitigations
- Man-in-the-middle attack mitigation via HTTPS
- Replay attack mitigations (design-dependent; see security docs)

### Encryption details
- Algorithm: AES-256-GCM
- Key derivation: PBKDF2 with SHA-256
- Iterations: \(100{,}000\)
- IV/nonce: Random \(12\)-byte IV per encryption (never reused)

### Compliance notes
- OWASP Top 10 (2021) aligned (see `SECURITY.md` for mapping and scope)
- GDPR-friendly by design (no personal data intentionally collected or stored)
- Uses FIPS 140-2 approved algorithms (note: this does not imply the application is FIPS-validated)

## Project structure

```text
PrivacyNote/
├── src/
│   ├── js/
│   │   ├── conf/            # Configuration (dev + prod unified)
│   │   ├── actions/         # Business logic (encryption, DB)
│   │   ├── services/        # Core services (DOM, Supabase, Turnstile)
│   │   └── utils/           # Utilities (validation, rate limiting)
│   ├── css/                 # Modular stylesheets
│   └── html/                # Dynamic HTML components
├── private/
│   ├── docs/                # Architecture and security documentation
│   └── sql/                 # Database schema and migrations
├── index.html               # Note creation page
└── note.html                # Note viewing page
```

## Technology stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JavaScript (ES modules), HTML5, CSS3 |
| Encryption | Web Crypto API (AES-256-GCM) |
| Database | Supabase (PostgreSQL) |
| Security | Cloudflare Turnstile, CSP headers |
| Hosting | GitHub Pages (HTTPS) |
| CI/CD | GitHub Actions |

## Local development

### Prerequisites
- Python \(3.x\) or any local static web server
- A modern browser with Web Crypto API support

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/1drive1hb/PrivacyNote.git
   cd PrivacyNote
   ```

2. Create `env.json` in the project root:
   ```json
   {
     "SUPABASE_URL": "https://your-project.supabase.co",
     "SUPABASE_KEY": "your-anon-key",
     "SUPABASE_TABLE_M": "",
     "CF_TR": "your-turnstile-site-key",
   }
   ```

3. Start a local server:
   ```bash
   python -m http.server 8080
   ```

4. Open http://localhost:8080

## Documentation

| Document | Description |
|----------|-------------|
| `private/docs/SECURITY.md` | Security documentation |
| `AGENTS.md` | Architecture and developer guide |
| `private/docs/ENVlogic.md` | Configuration flow (dev vs prod) |
| `private/docs/supabase.md` | Database schema and RLS policies |

## Contributing

This is a personal security project. Contributions are not actively solicited, but responsible vulnerability reports are welcome.

Security issues: report privately via GitHub Security Advisories  
https://github.com/1drive1hb/PrivacyNote/security/advisories/new

## License

© 2025 PrivacyNote. All rights reserved.

This project is provided for educational and personal use. Commercial use requires explicit permission from the author.

## Disclaimer

PrivacyNote applies industry-standard security practices, but no system is fully secure. You are responsible for:
- Verifying recipient identity before sharing links
- Understanding that anyone with the link can read the note once
- Avoiding use for highly sensitive or classified information

Operational best practices:
- Use a custom encryption key for sensitive content (for example, `#key=yourkey` in the URL, if supported by your build)
- Share links only via trusted, secure channels
- Confirm you are using HTTPS before entering sensitive data

## Links

- Live app: https://1drive1hb.github.io/PrivacyNote/
- GitHub: https://github.com/1drive1hb/PrivacyNote
- Issues: https://github.com/1drive1hb/PrivacyNote/issues

Built by Mat (https://github.com/1drive1hb), 2025

***

Would you like the tone to read more like an open-source README (community-friendly) or a product/security whitepaper (more formal and compliance-oriented)?