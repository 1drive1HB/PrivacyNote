# Gemini Project Analysis: PrivacyNote

This document outlines the analysis of the PrivacyNote project, providing a reference for future development and troubleshooting.

## 1. Project Overview

**PrivacyNote** is a web application for creating and sharing secure, self-destructing notes. It's built with vanilla JavaScript for the frontend and utilizes Supabase as the backend for data storage. The application is designed to be simple and secure, with a focus on user privacy.

## 2. Core Technologies

-   **Frontend**: HTML5, CSS3, Vanilla JavaScript (ESM).
-   **Backend**: Supabase (PostgreSQL database and API).
-   **Deployment**: GitHub Pages.

## 3. Key Features

-   **Secure Note Creation**: Users can write a note, which is then stored in the backend.
-   **Self-Destructing Notes**: Notes are designed to be read once and then expire.
-   **Client-Side Encryption**: The application includes logic for AES-256 encryption (`cryptoActions.js`), but it is **not currently implemented** in the note creation workflow. This is a critical security gap.
-   **Unique Link Generation**: A unique link is generated for each note.
-   **One-Click Copy & Share**: Easy sharing of the note link, including a "Share via WhatsApp" feature.

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
├───private\                   # Ignored by Git
├───public\                   # Ignored by Git
└───src\
    ├───css\
    │   └───styles.css
    └───js\
        ├───app.js                # Main entry point for index.html
        ├───config.js             # Configuration (generated during deployment)
        ├───load-Env.js           # Loads environment variables for local dev
        ├───actions\
        │   ├───cryptoActions.js  # Encryption/decryption logic
        │   ├───noteAction.js     # (Not found, but likely intended for note logic)
        │   ├───noteQuery.js      # Handles communication with Supabase
        │   └───softDelete.md
        └───services\
            ├───domApp_service.js   # DOM manipulation and UI services
            ├───noteApp_service.js  # Handles the application logic for notes
            └───supabase.js         # Initializes and exports the Supabase client
```

## 5. Application Workflow

1.  **Local Development**:
    -   Environment variables (`SUPABASE_URL`, `SUPABASE_KEY`) are loaded from `env.json` by `load-Env.js`.
    -   `config.js` then uses these variables to initialize the Supabase client.

2.  **Note Creation (`index.html`)**:
    -   `app.js` initializes the UI and event listeners.
    -   User enters a note and clicks "Create Secure Note".
    -   `noteApp_service.js` calls `createNote` from `noteQuery.js`.
    -   `noteQuery.js` sends the note content to the Supabase backend. **Currently, the content is sent in plaintext.**
    -   A unique URL for the note is generated and displayed to the user.

3.  **Note Viewing (`note.html`)**:
    -   The page retrieves the note ID from the URL.
    -   `getNote` from `noteQuery.js` is called to fetch the note from Supabase.
    -   The note content is displayed, and the note is marked as read in the database.

## 6. Build and Deployment

-   The project is deployed to GitHub Pages using the `.github/workflows/static.yml` workflow.
-   The workflow triggers on pushes to the `main` branch.
-   During deployment, it generates a `src/js/config.js` file using secrets (`SUPABASE_URL`, `SUPABASE_KEY`) stored in GitHub Actions. This is a good security practice to avoid committing secrets to the repository.
-   The entire project directory is then uploaded as a GitHub Pages artifact.

## 7. `.gitignore` Analysis

The `.gitignore` file correctly excludes:
-   **Secrets**: `.env`, `env.json`, `public/env.js`.
-   **Directories**: `public/`, `private/`.
-   **System files**: `.DS_Store`.
-   **Dependencies**: `node_modules/`.

This is a good setup for keeping sensitive information and unnecessary files out of the repository.

## 8. Recommendations and Areas for Improvement

-   **Implement Encryption**: The most critical issue is the lack of encryption for notes. The `encryptData` function from `cryptoActions.js` should be used before sending the note content to Supabase.
-   **Content Security Policy (CSP)**: Implement a CSP to prevent XSS attacks. This can be done by adding a `<meta>` tag to the HTML files.
-   **Error Handling**: Improve user-facing error messages for network issues or when a note is not found.
-   **Code Organization**: Consolidate the note creation and retrieval logic.

I am now familiar with your project. Please let me know what troubleshooting or improvements you would like to work on next.
