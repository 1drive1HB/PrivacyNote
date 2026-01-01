# PrivacyNote - Project Documentation

This document provides comprehensive information about the PrivacyNote project architecture, workflows, and implementation details.

## 1. Project Overview

**PrivacyNote** is a secure, self-destructing note sharing web application. Built with vanilla JavaScript (ESM modules) and Supabase backend, it prioritizes user privacy through optional client-side AES-256 encryption and automatic note destruction after reading.

**Live URL**: https://1drive1hb.github.io/PrivacyNote/

## 2. Core Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES Modules)
- **Backend**: Supabase (PostgreSQL database + REST API)
- **Encryption**: Web Crypto API (AES-256-GCM with PBKDF2 key derivation)
- **Bot Protection**: Cloudflare Turnstile (production) / Test mode (localhost)
- **Deployment**: GitHub Pages via GitHub Actions
- **Build System**: No build tools - native ESM + GitHub Actions secret injection

## 3. Key Features

- **Secure Note Creation**: Write notes with configurable security settings
- **Self-Destructing Notes**: Read-once notes that auto-delete after viewing
- **Optional Client-Side Encryption**: AES-256-GCM encryption (user-toggleable)
- **Configurable Expiration**: 24h or 48h note lifespan
- **Unique Link Generation**: Each note gets a unique shareable URL
- **One-Click Copy & Share**: Clipboard copy + WhatsApp sharing
- **Bot Protection**: Cloudflare Turnstile integration
- **Character Counter**: Real-time tracking (2250 char limit visible, 10000 hard limit)
- **Auto-Save Drafts**: localStorage-based draft persistence
- **Dark Mode**: Automatic based on system preference

## 4. Project Structure

```
C:\Users\mat\Desktop\MAT_PrivN_pc_n\
├───.gitignore
├───index.html                # Main page for creating notes
├───note.html                 # Page for viewing/reading a note
├───readme.md
├───.github\
│   └───workflows\
│       └───static.yml        # GitHub Actions workflow for deployment
├───private\                  # Ignored by Git and Gemini
├───public\                   # Ignored by Git
└───src\
    ├───css\
    │   ├───base.css
    │   ├───components.css
    │   ├───note.css
    │   ├───settings.css
    │   └───styles.css
    ├───html\
    │   └───settings.html         # HTML for the settings UI
    └───js\
        ├───main.js               # Main entry point for index.html
        ├───config.js             # Configuration (generated during deployment)
        ├───load-Env.js           # Loads environment variables for local dev
        ├───actions\
        │   ├───cryptoActions.js  # Encryption/decryption logic
        │   ├───noteQuery.js      # Handles communication with Supabase
        │   └───settingsUI.js     # Manages the settings UI component
        └───services\
            ├───dom.service.js    # DOM manipulation and UI services
            ├───note.service.js   # Handles the application logic for notes
            ├───supabase.js         # Initializes and exports the Supabase client
            ├───turnstile.js        # Manages Cloudflare Turnstile integration
            └───whatsappUI.js       # Manages the WhatsApp sharing UI

├─── private\sql\  --> three supabse files for analysis of DB
```

## 5. Application Workflow

### Local Development
- Environment variables loaded from `env.json` via `load-Env.js`
- `config.js` initializes with `window.__ENV` object
- Localhost detection enables test Turnstile mode
- No build step required - direct file serving

### Note Creation Flow (`index.html`)
1. **Initialization** (`main.js` - PrivacyNoteApp class):
   - DOM elements cached
   - Settings UI loaded from `settings.html` and injected into container
   - `SettingsUI.initialize()` sets up accordion, radio buttons, defaults
   - `TurnstileService.init()` loads appropriate bot protection
   - `WhatsAppUI.init()` sets up sharing handlers
   - Draft note restored from localStorage if exists

2. **User Interaction**:
   - User types note (auto-saved to localStorage)
   - Character counter updates in real-time
   - Settings accordion allows encryption toggle + expiration selection
   - Defaults: encryption=true, expiration=24h

3. **Note Creation** (on button click):
   - `SettingsUI.getCurrentSettings()` retrieves user choices
   - `NoteService.createNote()` called with content + settings
   - `noteQuery.createNote()` handles encryption (if enabled) via `cryptoActions.js`
   - Supabase insert with: content, is_encrypted, expires_in_24h/48h, read_count=0
   - Returns note ID and generates shareable URL
   - `DomService` displays link container with copy-to-clipboard functionality
   - WhatsApp share button enabled with URL

### Note Viewing Flow (`note.html`)
1. **URL Parsing**:
   - Note ID extracted from query parameter `?id=xxx`
   - If no ID: show error "note does not exist"

2. **Note Retrieval**:
   - `NoteService.viewNote()` orchestrates the flow
   - `noteQuery.getNote(id)` fetches from Supabase
   - Validates: read_count=0 (not read), expires_at > now (not expired)
   - If validation fails: return null → show error

3. **Decryption & Display**:
   - If `is_encrypted=true`: decrypt via `cryptoActions.decryptData()`
   - If `is_encrypted=false`: return plain text
   - Display content with newlines converted to `<br>`
   - Mark as read: `read_count=1` → note destroyed for future requests
   - Clean URL (remove query params from browser)

### Error Handling
- All errors show generic message: "This note does not exist or has been deleted"
- Prevents information leakage about note status
- Loading spinner removed on error

## 6. Build and Deployment

### GitHub Actions Workflow (`.github/workflows/static.yml`)
- **Trigger**: Push to `main` branch
- **Process**:
  1. Checkout repository
  2. Generate `src/js/config.js` from GitHub Secrets
  3. Secrets injected: SUPABASE_URL, SUPABASE_KEY, SUPABASE_TABLE_M, CF_TR, CF_SECRET_KEY, ENCRYPTION_KEY
  4. Set `isProduction: true` in config
  5. Upload entire directory as GitHub Pages artifact
  6. Deploy to https://1drive1hb.github.io/PrivacyNote/

### Security Notes
- `config.js` NOT committed to repo (generated at deploy time)
- Secrets stored in GitHub Actions encrypted vault
- XOR encryption used for additional secret obfuscation in config file
- CSP headers in HTML prevent XSS attacks
- CORS configured for Supabase and Cloudflare domains

## 7. File Organization

### Core Application Files
- `index.html` - Main note creation page
- `note.html` - Note viewing page
- `load-Env.js` - Environment loader (dev vs prod detection)
- `config.js` - Configuration (generated/gitignored)

### JavaScript Modules
**Services** (business logic):
- `note.service.js` - Note creation/viewing orchestration
- `dom.service.js` - DOM manipulation utilities
- `supabase.js` - Supabase client initialization
- `turnstile.js` - Cloudflare Turnstile bot protection
- `whatsappUI.js` - WhatsApp sharing functionality

**Actions** (data operations):
- `noteQuery.js` - Supabase CRUD operations
- `cryptoActions.js` - AES-256 encryption/decryption
- `settingsUI.js` - Settings accordion component
- `oldCry.js` - Legacy crypto (unused)

**Entry Points**:
- `main.js` - Index page initialization (PrivacyNoteApp class)

### CSS Structure
- `base.css` - Global styles, variables, layout
- `components.css` - Buttons, forms, Turnstile widget
- `note.css` - Note viewing page styles
- `settings.css` - Settings accordion styles
- `styles.css` - Import aggregator

### HTML Components
- `settings.html` - Settings accordion markup (loaded dynamically)

## 8. Security & Privacy

### Encryption Implementation
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations, SHA-256
- **Salt**: Static 'secure-note-salt' (consistent for same key)
- **IV**: Random 12-byte IV per encryption
- **Format**: JSON with {iv: [], data: []} arrays
- **Toggle**: User can disable encryption for plain text storage

### Data Flow Security
- Client-side encryption happens before Supabase transmission
- Encryption key stored in config (server-side for backend encryption model)
- Notes marked read_count=1 immediately after viewing
- Expired notes rejected at database level (expires_at check)
- No note recovery mechanism once read/expired

### Bot Protection
- **Production**: Real Cloudflare Turnstile with sitekey validation
- **Localhost**: Test mode widget (auto-passes)
- **Detection**: Hostname-based (github.io vs localhost/192.168.x.x)
- Submit button disabled until Turnstile verification

## 9. `.gitignore` Configuration

Excluded from version control:
- **Secrets**: `.env`, `env.json`, `public/env.js`, `src/js/config.js`
- **Directories**: `public/`, `private/`
- **IDE/System**: `.vscode/`, `.gemini/`
- **Logs**: `.rovodev/log/`, `.rovodev/sessions/`

## 10. Known Limitations & Design Decisions

### Character Limits
- **Visible limit**: 2250 characters (UI warning)
- **Hard limit**: 10,000 characters (enforced in code)
- **Database**: No explicit limit (PostgreSQL text type)

### Encryption Key Management
- Single shared key (not true E2E encryption)
- Key stored in GitHub Secrets (accessible to server)
- True E2E would require key in URL hash (future enhancement)

### Note Expiration
- Time-based (24h/48h) OR read-based (whichever first)
- No manual deletion option for creator
- Database cleanup handled by Supabase policies (assumed)

### Browser Compatibility
- Requires Web Crypto API support (all modern browsers)
- ES Module support required (no transpilation)
- localStorage required for draft saving

## 11. Development Workflow

### Local Setup
1. Create `env.json` in project root:
```json
{
  "SUPABASE_URL": "your-url",
  "SUPABASE_KEY": "your-key",
  "SUPABASE_TABLE_M": "table-name",
  "CF_TR": "cloudflare-sitekey",
  "CF_SECRET_KEY": "cf-secret",
  "ENCRYPTION_KEY": "your-encryption-key"
}
```
2. Serve with local HTTP server (e.g., `python -m http.server 8080`)
3. Access at `http://localhost:8080`

### Production Deployment
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Secrets injected from repository settings
4. Live at https://1drive1hb.github.io/PrivacyNote/

### Testing
- No automated test suite currently
- Manual testing required for both environments
- Test Turnstile widget available for localhost

