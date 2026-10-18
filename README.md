# Clue Vault

Password-protected scavenger hunt clues. Static HTML/CSS/JavaScript, no build step or database. Tagalog player and organizer screens; mobile layout.

## Deploy to Vercel

1. Unzip this project and put its contents in a new GitHub repository. `index.html` must be at the repository root.
2. In Vercel, create a project and import that repository.
3. Choose **Other** as the framework preset. Leave build and install command overrides disabled; use `.` as the output directory and the repository root as Root Directory.
4. Deploy, then open the HTTPS production URL.

This project has not been deployed on your Vercel account. You need your own Vercel login. No environment variables or paid database are required.

Alternative with the Vercel CLI installed: run `vercel --prod` from the project folder and follow its account/project prompts.

## Use

1. Click **Gumawa ng clue**. Write the title and clue, choose a password of at least six characters, and generate a link.
2. **Test clue** in a new tab with the password. Check the destination before the event.
3. Copy the complete link, including everything after `#open=`, and send it to players or put that full link into your preferred QR generator. Long clues produce long links; keep clues short for easier QR scanning. Test each printed QR on a phone.
4. Download the link backup for each clue, and record passwords separately. Backups contain a readable organizer title and encrypted link, without the password. To reuse one, open its `url` value in a browser.
5. Players open the link and enter the exact password. The sample uses `simula`.

## Local preview and checks

Run `python3 -m http.server 3000` in this folder, then visit `http://localhost:3000`. Do not open `index.html` directly as a file: ES modules and Web Crypto require a supported origin. Run `npm test` with Node 20+ to check encryption, wrong-password rejection, tamper rejection, random salt/IV generation and malformed input handling. No npm install is needed.

## How protection works

Web Crypto derives an AES-256-GCM key using PBKDF2-SHA-256 (310,000 iterations), with a new random 16-byte salt and 12-byte IV for each clue. Both title and clue are encrypted. The URL fragment contains only the version, salt, IV, and ciphertext; the password is never included. Fragments are not part of HTTP requests to the host. All assets are local; there are no analytics or external scripts. Decrypted text is rendered as plain text, never HTML.

People with the link can try passwords offline: a short puzzle answer can be guessed. This is intended for game clues, not highly sensitive information. Anyone who unlocks a clue can copy it. Passwords cannot be recovered.

This is a shareable encrypted-clue app inspired by a password-protected text workflow, not a shared editable notes service. Clues are not stored on a server. A generated link is an immutable snapshot: to revise a clue, generate and share a new link; older links remain usable and cannot be revoked. The builder is public and stores no drafts or account data. Generated links disappear from the builder on refresh unless copied or downloaded. Keep the deployed domain stable so printed links continue to work.

For server-backed editable pages, revocation, organizer accounts, scoreboards, or attempt limits, add a backend and authentication as a separate extension.
