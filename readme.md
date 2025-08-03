Get-ChildItem -Recurse -File

python -m http.server 8080

NewPrivN/
├── .env.local
├── index.html
├── readme.md
└── src/
    ├── css/
    │   └── styles.css
    ├── html/
    │   └── messageURL.html
    └── js/
        ├── actions/
        │   ├── cryptoActions.js
        │   └── noteActions.js
        ├── services/
        │   └── supabase.js
        ├── app.js
        └── config.js


CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

// for now without rts and encryption

