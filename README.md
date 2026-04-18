# Social Media Partner BD - Automation Dashboard

A professional React-based dashboard for managing AI digital product sales with automated Google Drive & Email delivery.

## 🚀 Deployment (Netlify + GitHub)

This project is optimized for **Netlify Functions**. Follow these steps to deploy:

1.  **Download the Code:** Download the project ZIP from AI Studio.
2.  **Upload to GitHub:**
    *   Initialize a new repository on GitHub.
    *   Upload all files (ensure `functions/` and `netlify.toml` are present).
3.  **Deploy on Netlify:**
    *   In Netlify, click **"Add new site"** > **"Import an existing project"**.
    *   Connect your GitHub account and select this repository.
    *   **Settings:** Netlify will auto-detect the settings from `netlify.toml`.
    *   **Fix Tip:** If you see a "Failed to resolve src/main.tsx" error, I have already updated `index.html` to use a relative path (`src/main.tsx`) which is the standard fix for Netlify's Linux environment.

## 🤖 Automation Features

*   **Manual Approval:** Orders wait in the "Pending" tab for admin verification.
*   **Auto-Access:** Clicking "Approve" triggers a Netlify Function that grants Google Drive access via Service Account.
*   **Auto-Email:** Sends a professional delivery email using Nodemailer (Gmail).
*   **Live Tracking:** Customers can track their TxID on the landing page.

## 🔍 SEO & Sitemap

*   **Sitemap:** Automatically generated during `npm run build` using `vite-plugin-sitemap`.
*   **Robots.txt:** Configured in the `public/` folder to guide search engines.

## 🛠️ Tech Stack

*   **Frontend:** React 19, Tailwind CSS 4, Motion, Lucide.
*   **Backend:** Netlify Functions (Serverless Node.js).
*   **Services:** Google Drive API v3, Nodemailer, Firebase (Firestore & Auth).

---
*Created with ❤️ for Social Media Partner BD.*
