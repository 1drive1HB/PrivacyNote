# PrivacyNote - Secure Note Sharing

![App Screenshot](public/screenshot.png)

A secure, self-destructing note sharing application with end-to-end encryption.

## Features

- 🔒 Client-side encryption (AES-256)
- ⏱️ Self-destructing notes
- 📱 Mobile-friendly UI
- 🌓 Dark mode support
- 📋 One-click copy & share

## Setup

1. Clone the repository
2. Create `env.json` in root directory:
```json
{
  "SUPABASE_URL": "your-supabase-url",
  "SUPABASE_KEY": "your-supabase-key"
}

C:\Users\Mat\Desktop\NewPrivN\
│   .gitignore
│   env.json
│   index.html
│   note.html
│   readme.md
│
├───.github
│   └───workflows
│           static.yml
│
├───public
│       .gitleaks.toml
│       .ttt.md
│       3rd.yml
│       better_arh.md
│       dbshema.md
│       env.js
│       env.local
│       oldStatic.yml
│       static.yml
│       supabaseRLS.md
│       todo.md
│
└───src
    ├───css
    │       styles.css
    │
    └───js
        │   app.js
        │   config.js
        │   load-Env.js
        │
        ├───actions
        │       cryptoActions.js
        │       noteAction.js
        │       noteQuery.js
        │       softDelete.md
        │
        └───services
                supabase.js
                supabaseAutoCleanup.sql