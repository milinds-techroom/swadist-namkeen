# Swadist Namkeen — Angular starter

A responsive Diwali-themed Angular website starter with Bootstrap 5, a 5-second product carousel, an order form, and a Google Apps Script integration placeholder.

## Requirements
- Node.js compatible with Angular 20 (Node.js 20.19+, 22.12+, or 24+ recommended)
- npm

## Run locally
1. Extract the ZIP.
2. Open a terminal in the `swadist-namkeen` folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start Angular:

   ```bash
   npm start
   ```

5. Open the local URL shown in the terminal (usually `http://localhost:4200`).

## Important setup notes
- The supplied official logo is copied to `public/images/sw adist-logo.png`? Check the `public/images` folder and rename the logo file to `swadist-logo.png` if needed.
- Product images in this starter are illustrative placeholders. Replace them with the real packet photos from the official website before publishing.
- Google Sheets is not connected yet. In `src/app/app.component.ts`, replace `GOOGLE_APPS_SCRIPT_URL` with your deployed Apps Script web-app URL after setting up and testing the script.
- Do not collect unnecessary customer data. Publish a privacy/contact notice before launching.

## Main files
- `src/app/app.component.ts` — product data, 5-second carousel, form submission
- `src/app/app.component.html` — page markup
- `src/app/app.component.css` — component styles
- `src/styles.css` — global styles and Bootstrap customizations
