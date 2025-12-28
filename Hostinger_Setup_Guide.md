# Complete Hostinger Setup Guide (From Zero to Live)

Since you have purchased a **New Domain** and have **Hostinger Hosting**, follow these steps exactly to go from a fresh domain to a live website.

---

## Phase 1: Connect Domain & Activate Hosting

### 1. Point Domain to Hostinger (Nameservers)
*If you bought the domain from Hostinger, skip to step 2.*
If you bought the domain from GoDaddy, Namecheap, etc.:
1.  Log in to your domain provider.
2.  Find **DNS Management** or **Nameservers**.
3.  Change Nameservers to Hostinger's default:
    *   `ns1.dns-parking.com`
    *   `ns2.dns-parking.com`
4.  Save. (It may take 1-24 hours to propagate).

### 2. Add Website to Hostinger
1.  Log in to **Hostinger hPanel**.
2.  Go to **Websites** > **Add Website**.
3.  Select **"Existing Domain"** and enter your new domain name (e.g., `mytravelagency.com`).
4.  Follow the setup wizard (skip "Create a Website" options if you want to upload your own code later).
5.  Once added, you will see it in your Dashboard.

### 3. Activate SSL (Generic/Free)
1.  Go to **Security** > **SSL** in hPanel.
2.  Click **Install SSL** for your new domain.
3.  Select "Let's Encrypt" (Free) and install.
4.  Ensure "Force HTTPS" is ON (Go to Dashboard > Security to check).

---

## Phase 2: Create the Database

1.  In hPanel, go to **Databases** > **Management**.
2.  **Create New Database**:
    *   **Database Name**: `u123456_traveldb` (Note this down)
    *   **Username**: `u123456_admin` (Note this down)
    *   **Password**: Create a strong password (e.g., `Travel@2025!`) (Note this down)
3.  Click **Create**.

---

## Phase 3: Deploy Backend (API)

We will host the backend (Node.js) on a subdomain like `api.mytravelagency.com`.

### 1. Create Subdomain
1.  In hPanel, go to **Domains** > **Subdomains**.
2.  Create a new subdomain: `api` (Result: `api.mytravelagency.com`).
3.  Use "Custom folder for subdomain" if asked, default is usually `public_html/api` or `domains/yourdomain/public_html/api`. Let's assume **`public_html/api`**.

### 2. Prepare & Upload Backend Files
1.  **On your Computer**: Go to your project folder > `server` folder.
2.  **Zip the contents**: Select all files inside `server` (`index.js`, `package.json`, `auth.js`, etc.) and Zip them (`backend.zip`).
3.  **Upload**:
    *   In Hostinger, go to **Files** > **File Manager**.
    *   Navigate to your subdomain folder (`public_html/api`).
    *   Upload `backend.zip` and **Extract** it there.
    *   Delete the zip file.

### 3. Setup Node.js Application
1.  In hPanel, search for **Node.js** (under Advanced).
2.  **Create Application**:
    *   **Node.js Version**: 18.x or 20.x.
    *   **Application Mode**: Production.
    *   **Application Root**: `public_html/api` (The folder where you uploaded files).
    *   **Application Startup File**: `index.js`.
3.  Click **Create**.
4.  Once created, click the **NPM Install** button to install libraries.

### 4. Configure Database Connection
1.  In File Manager (`public_html/api`), create a new file named `.env`.
2.  Paste this inside (replace with YOUR Phase 2 info):
    ```env
    PORT=3000
    DB_HOST=localhost
    DB_USER=u123456_admin      <-- Your DB Username
    DB_PASSWORD=Travel@2025!   <-- Your DB Password
    DB_NAME=u123456_traveldb   <-- Your Database Name
    JWT_SECRET=mysecretkey123
    ```
3.  Save and Close.
4.  **Restart Node.js App**: Go back to Node.js settings and click **Restart**.

---

## Phase 4: Deploy Frontend (Website)

### 1. Connect Frontend to Live Backend
1.  **On your Computer**: Open `App.tsx` in your project.
2.  Find line: `const API_BASE = 'http://localhost:5000/api';`
3.  Change it to your subdomain:
    ```typescript
    const API_BASE = 'https://api.mytravelagency.com/api'; 
    // ^ Replace with your actual domain
    ```
4.  Save.

### 2. Build the Website
1.  Open Terminal in VS Code.
2.  Run: `npm run build`
3.  This creates a **`dist`** folder in your project.

### 3. Upload Frontend
1.  **Zip the `dist` folder contents**: Go inside `dist`, select everything (`index.html`, `assets`, etc.), and Zip them (`frontend.zip`).
2.  **Upload**:
    *   In Hostinger File Manager, go to **`public_html`** (The root folder, NOT the api folder).
    *   Delete `default.php` if it exists.
    *   Upload `frontend.zip` and **Extract** it.
    *   Ensure `index.html` is directly in `public_html`.

### 4. Fix Refresh Error (Important!)
Since this is a React app, refreshing pages will give 404 error without this step.
1.  In `public_html`, create a new file named **`.htaccess`**.
2.  Paste this code:
    ```apache
    <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteBase /
      RewriteRule ^index\.html$ - [L]
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteCond %{REQUEST_FILENAME} !-l
      RewriteRule . /index.html [L]
    </IfModule>
    ```
3.  Save.

---

## Phase 5: Final Check

1.  Open your website: `https://mytravelagency.com`
2.  Try to **Sign Up / Login**.
3.  If it works, congratulations! Your SaaS is live. 🚀
