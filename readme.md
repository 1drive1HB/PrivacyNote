# PrivacyNote

A secure, self-destructing notes application built with Supabase and GitHub Pages.

🔗 **Live Demo**: [https://1drive1hb.github.io/PrivacyNote/](https://1drive1hb.github.io/PrivacyNote/)

## Features

- Create temporary notes that self-destruct after being read
- No server-side storage (notes are deleted immediately after viewing)
- Clean, responsive interface
- GitHub Pages deployment

## Project Structure

```
PrivacyNote/
├── .env.local                # Local environment variables
├── index.html                # Main application page
├── note.html                 # Note viewing page
├── supabaseRLS.sql           # Supabase table schema
├── supabaseAutoCleanup.sql   # Automated cleanup SQL
└── src/
    ├── css/
    │   └── styles.css       # Application styles
    └── js/
        ├── actions/
        │   ├── cryptoActions.js  # Encryption functions
        │   └── noteActions.js    # Note CRUD operations
        ├── services/
        │   └── supabase.js       # Supabase client setup
        ├── app.js                # Main application logic
        └── config.js            # Configuration manager
```

## Database Schema

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/1drive1HB/PrivacyNote.git
   cd PrivacyNote
   ```

2. Create a `.env.local` file (copy from `.env.example` if available):
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   ```

3. Start a local server:
   ```bash
   python -m http.server 8080
   ```

4. Open in browser: [http://localhost:8080](http://localhost:8080)

## Deployment

The application is automatically deployed to GitHub Pages on push to the `main` branch.

## Technical Details

- **Frontend**: Vanilla JavaScript with ES Modules
- **Backend**: Supabase (PostgreSQL)
- **Hosting**: GitHub Pages
- **Security**: 
  - Notes are immediately deleted after reading
  - Environment variables for sensitive configuration
  - Proper .gitignore setup to prevent secret leakage

## Roadmap

- [ ] Implement Row Level Security (RLS) in Supabase
- [ ] Add optional note encryption
- [ ] Support custom expiration times
- [ ] Add multi-environment configuration (dev/stage/prod)

## License

MIT License - See [LICENSE](LICENSE) for details.


Key improvements made to your README:

1. Proper Markdown formatting with clear sections
2. Added live demo link at the top
3. Organized project structure in a readable tree format
4. Included the database schema in a code block
5. Added clear local development instructions
6. Mentioned deployment information
7. Added technical details section
8. Included a roadmap for future features
9. Added license information (you should create a LICENSE file)
