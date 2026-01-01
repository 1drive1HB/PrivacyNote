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

1.  **Local Development**:
    -   Environment variables (`SUPABASE_URL`, `SUPABASE_KEY`, etc.) are loaded from `env.json` by `load-Env.js`.
    -   `config.js` then uses these variables to initialize the Supabase client.

2.  **Note Creation (`index.html`)**:
    -   `main.js` is the main entry point. It initializes the UI, loads the settings component using `SettingsUI.js`, and sets up event listeners.
    -   The user enters a note, chooses encryption and expiration settings, and clicks "Create Secure Note".
    -   `note.service.js` reads the settings and calls `createNote` from `noteQuery.js`.
    -   `noteQuery.js` **encrypts the content** (if enabled) using `cryptoActions.js` and sends it to the Supabase backend.
    -   A unique URL for the note is generated and displayed to the user. `dom.service.js` is used for DOM manipulations, like showing the generated link and feedback messages.
    -   `whatsappUI.js` handles the logic for the "Share via WhatsApp" button.
    -   `turnstile.js` manages the Cloudflare Turnstile integration for bot protection.

3.  **Note Viewing (`note.html`)**:
    -   The page retrieves the note ID from the URL.
    -   `note.service.js` calls `getNote` from `noteQuery.js` to fetch the note from Supabase.
    -   If the note was encrypted, `noteQuery.js` **automatically decrypts the content** using `cryptoActions.js`.
    -   The note content is displayed, and the note is marked as read in the database, effectively destroying it.

## important: .github\workflows\static.yml:

## 6. Build and Deployment

-   The project is deployed to GitHub Pages using the `.github/workflows/static.yml` workflow.
-   The workflow triggers on pushes to the `main` branch.
-   During deployment, it generates a `src/js/config.js` file using secrets (`SUPABASE_URL`, `SUPABASE_KEY`, `ENCRYPTION_KEY`, etc.) stored in GitHub Actions. The secrets are XOR encrypted before being written to the config file. This is a good security practice to avoid committing secrets to the repository. The `config.js` file is created with the production values, and the `isProduction` flag is set to `true`.
-   The entire project directory is then uploaded as a GitHub Pages artifact.

## 7. `.gitignore` Analysis

The `.gitignore` file correctly excludes:
-   **Secrets**: `.env`, `env.json`, `public/env.js`.
-   **Directories**: `public/`, `private/`.
-   **IDE and System Files**: `/.vscode/`, `/.gemini/`

This is a robust setup for keeping sensitive information and unnecessary files out of the repository.

