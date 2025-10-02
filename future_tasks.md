# Future Tasks for PrivacyNote

This document outlines a list of recommended tasks and improvements for the PrivacyNote project.

## High Priority

-   **Implement Content Security Policy (CSP)**: To mitigate XSS risks, a strong CSP should be implemented. This can be done by adding a `<meta http-equiv="Content-Security-Policy" ...>` tag to the `index.html` and `note.html` files.
-   **URL Hashing for Encryption Key**: For true end-to-end encryption, the encryption key should be moved to the URL hash (`#`). This would prevent the key from ever being sent to the server, ensuring that even the server operator cannot decrypt the notes.
-   **Improve Error Handling**: Enhance user-facing error messages for scenarios like network failures, expired notes, or when a note is not found. This will provide clearer feedback to the user on the `note.html` page.

## Medium Priority

-   **Code Refactoring**:
    -   The `domApp_service.js` and `main.js` files have some overlapping responsibilities regarding UI manipulation. Refactor the code to centralize all direct DOM manipulations in `DomAppService`.
    -   The `noteApp_service.js` and `noteAction.js` files could be combined into a single `note_service.js` to reduce redundancy.
-   **Dependency Management**: The project currently loads the Supabase client from a CDN. Using a package manager like npm or yarn would make it easier to manage dependencies, track versions, and keep them up to date.
-   **Automated Testing**:
    -   Implement unit tests for the encryption logic in `cryptoActions.js`.
    -   Implement unit tests for the Supabase communication in `noteQuery.js`.
    -   Implement end-to-end tests to verify the application's functionality from the user's perspective.

## Low Priority

-   **Modular CSS**: The CSS is already well-organized, but it could be further improved by using a more modular approach, such as BEM (Block, Element, Modifier), to make the styles more reusable and maintainable.
-   **Add a "Copy to Clipboard" Button for the Note Content**: On the `note.html` page, add a button that allows the user to easily copy the note content to their clipboard.
-   **Add a "New Note" Button on the Note Page**: After a note is read, provide a button that takes the user back to the `index.html` page to create a new note.
-   **Improve the UI/UX**: The UI is simple and functional, but it could be improved with a more modern design and a better user experience. For example, you could add a dark mode, a more intuitive settings menu, and a more visually appealing note page.

## 5. Analysis and Recommendations

### What's Good

-   **Security**: The application uses client-side encryption and a secure deployment process, which are excellent security practices.
-   **Simplicity**: The codebase is simple, well-organized, and easy to understand.
-   **User Experience**: The application is easy to use and has a clean, minimalist UI.
-   **Modularity**: The code is well-structured into modules and services, which makes it easy to maintain and extend.
-   **Vanilla JS**: The use of vanilla JavaScript makes the application lightweight and fast.

### What Could Be Improved

-   **Security**: While the application is secure, it could be further improved by implementing a Content Security Policy (CSP) and moving the encryption key to the URL hash.
-   **Error Handling**: The error handling could be more robust and user-friendly.
-   **Code Duplication**: There is some code duplication between `domApp_service.js` and `main.js`, and between `noteApp_service.js` and `noteAction.js`.
-   **Dependency Management**: The project relies on a CDN for the Supabase client, which could be managed more effectively with a package manager.
-   **Testing**: The project lacks an automated testing suite, which would help to ensure the quality and reliability of the code.

### Recommendations

For a detailed list of recommendations and future tasks, please see the [`future_tasks.md`](./future_tasks.md) file.