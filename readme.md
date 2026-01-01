# PrivacyNote

**[Live Application →](https://1drive1hb.github.io/PrivacyNote/)**

Enterprise-grade secure note sharing with client-side encryption and zero-knowledge architecture. Messages self-destruct after reading, ensuring true privacy.

---

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| **Encryption** | AES-256-GCM with PBKDF2 key derivation (100,000 iterations) |
| **Architecture** | Zero-knowledge (server never sees plaintext) |
| **Self-Destruct** | Automatic deletion after first read |
| **Input Validation** | Comprehensive sanitization (XSS, SQL injection, pattern detection) |
| **Rate Limiting** | Client-side: 5 notes/minute |
| **XSS Protection** | CSP headers + safe DOM manipulation |
| **Database Security** | Row-level security, CHECK constraints |

**→ [Full Security Documentation](private/docs/SECURITY.md)**

---

## ✨ Key Features

- **🔐 Client-Side Encryption** – All encryption happens in your browser using Web Crypto API
- **🔥 One-Time Read** – Notes self-destruct immediately after viewing
- **⏱️ Flexible Expiration** – Choose 24h or 48h lifetime
- **📱 Mobile-Optimized** – Responsive design with dark mode support
- **📋 Quick Sharing** – One-click copy link or share via WhatsApp
- **🤖 Bot Protection** – Cloudflare Turnstile integration
- **🌐 No Tracking** – No cookies, no analytics, no personal data collection

---

## 🚀 Quick Start

### Create a Note
1. Visit [PrivacyNote](https://1drive1hb.github.io/PrivacyNote/)
2. Type your message (max 8,000 characters)
3. Choose encryption and expiration settings
4. Click "Create Secure Note"
5. Share the generated link

### View a Note
1. Open the shared link
2. Note is displayed **once**
3. Automatically deleted from server
4. Link becomes invalid

---

## 🛡️ Security Guarantees

### ✅ Protected Against
- Cross-Site Scripting (XSS)
- SQL Injection
- JavaScript Code Injection
- CSRF (Cross-Site Request Forgery)
- Clickjacking
- Man-in-the-Middle Attacks
- Replay Attacks

### 🔐 Encryption Details
- **Algorithm:** AES-256-GCM (Galois/Counter Mode)
- **Key Derivation:** PBKDF2 with SHA-256
- **Iterations:** 100,000 (OWASP recommended)
- **IV:** Random 12 bytes per encryption (never reused)

### 📊 Compliance
- ✅ OWASP Top 10 (2021) compliance
- ✅ GDPR compliant (no personal data stored)
- ✅ Zero-knowledge architecture
- ✅ FIPS 140-2 compliant algorithms

---

## 📁 Project Structure

```
PrivacyNote/
├── src/
│   ├── js/
│   │   ├── conf/           # Configuration (dev + prod unified)
│   │   ├── actions/        # Business logic (encryption, DB)
│   │   ├── services/       # Core services (DOM, Supabase, Turnstile)
│   │   └── utils/          # Utilities (validation, rate limiting)
│   ├── css/                # Modular stylesheets
│   └── html/               # Dynamic HTML components
├── private/
│   ├── docs/               # Architecture & security documentation
│   └── sql/                # Database schema & migrations
├── index.html              # Note creation page
└── note.html               # Note viewing page
```

---

## 🔧 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JavaScript (ES6 modules), HTML5, CSS3 |
| **Encryption** | Web Crypto API (AES-256-GCM) |
| **Database** | Supabase (PostgreSQL) |
| **Security** | Cloudflare Turnstile, CSP headers |
| **Hosting** | GitHub Pages (HTTPS enforced) |
| **CI/CD** | GitHub Actions |

---

## 🧪 Local Development

### Prerequisites
- Python 3.x (or any local web server)
- Modern browser with Web Crypto API support

### Setup
1. Clone the repository
   ```bash
   git clone https://github.com/1drive1hb/PrivacyNote.git
   cd PrivacyNote
   ```

2. Create `env.json` in project root
   ```json
   {
     "SUPABASE_URL": "https://your-project.supabase.co",
     "SUPABASE_KEY": "your-anon-key",
     "SUPABASE_TABLE_M": "notes",
     "CF_TR": "your-turnstile-key",
     "CF_SECRET_KEY": "your-secret",
     "ENCRYPTION_KEY": "your-encryption-key"
   }
   ```

3. Start local server
   ```bash
   python -m http.server 8080
   ```

4. Open `http://localhost:8080`

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [SECURITY.md](private/docs/SECURITY.md) | Comprehensive security documentation |
| [AGENTS.md](AGENTS.md) | Codebase architecture & developer guide |
| [ENVlogic.md](private/docs/ENVlogic.md) | Configuration flow (dev vs prod) |
| [supabase.md](private/docs/supabase.md) | Database schema & RLS policies |

---

## 🤝 Contributing

This is a personal security project. While contributions are not actively sought, security vulnerability reports are welcome.

**Security Issues:** Please report privately via [GitHub Security Advisories](https://github.com/1drive1hb/PrivacyNote/security/advisories/new)

---

## 📜 License

© 2025 PrivacyNote. All rights reserved.

This project is for educational and personal use. Commercial use requires explicit permission.

---

## ⚠️ Disclaimer

PrivacyNote implements industry-standard security practices but **no system is 100% secure**. Users are responsible for:
- Verifying recipient identity before sharing links
- Understanding that anyone with the link can read the note once
- Not using this for highly sensitive/classified information

**Best Practices:**
- Use custom encryption keys for sensitive data (`#key=yourkey` in URL)
- Share links via secure channels only
- Verify HTTPS connection (padlock icon)

---

## 🔗 Links

- **Live App:** https://1drive1hb.github.io/PrivacyNote/
- **GitHub:** https://github.com/1drive1hb/PrivacyNote
- **Issues:** https://github.com/1drive1hb/PrivacyNote/issues

---

**Built with 🔒 by [Mat](https://github.com/1drive1hb) | 2025**
