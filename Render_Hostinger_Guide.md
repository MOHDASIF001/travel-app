# Hybrid Deployment Guide: Hostinger (Frontend/DB) + Render (Backend)

Since your Hostinger plan doesn't support Node.js directly, we will use **Render.com (Free)** for the Backend and keep your Website and Database on **Hostinger**.

---

## Phase 1: Database Setup (Hostinger)

1.  **Create Database**:
    *   Go to Hostinger **Databases**.
    *   Create a new Database (Note down Name, Username, Password).
2.  **Enable Remote Access (CRUCIAL)**:
    *   In Hostinger Dashboard, find **"Remote MySQL"** (under Databases section).
    *   In the **Host (% or IP)** field, enter: `%`
        *   *(The `%` symbol means "Allow connection from Anywhere", which is needed because Render's IP changes).*
    *   Select your database from the dropdown.
    *   Click **Create**.
    *   *Note: This allows external connections to your DB.*

---

## Phase 2: Push Code to GitHub

Render needs your code to be on GitHub.

1.  **Initialize Git (if not done)**:
    *   Open VS Code Terminal.
    *   Run: `git init` (if you haven't already).
    *   Run: `git add .`
    *   Run: `git commit -m "Ready for deployment"`
2.  **Push to GitHub**:
    *   Create a **New Repository** on GitHub.com (e.g., `itinerary-saas`).
    *   Follow GitHub's instructions to push your code:
        ```bash
        git remote add origin https://github.com/YOUR_USERNAME/itinerary-saas.git
        git branch -M main
        git push -u origin main
        ```

---

## Phase 3: Deploy Backend to Render.com

1.  **Create Service**:
    *   Log in to [Render.com](https://render.com).
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository (`itinerary-saas`).
2.  **Configure Settings**:
    *   **Name**: `itinerary-api` (or anything).
    *   **Region**: Singapore (closest to India) or Frankfurt.
    *   **Branch**: `main`.
    *   **Root Directory**: Leave empty (default).
    *   **Runtime**: Node.
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server/index.js`
3.  **Environment Variables (Advanced Button)**:
    *   Click **"Add Environment Variable"**. Add these keys and values:
        *   `PORT`: `10000` (Render default)
        *   `DB_HOST`: **Your Hostinger Domain or IP** (Find "External IP" in Hostinger DB stats, or use your domain name).
        *   `DB_USER`: Your Hostinger DB Username.
        *   `DB_PASSWORD`: Your Hostinger DB Password.
        *   `DB_NAME`: Your Hostinger DB Name.
        *   `JWT_SECRET`: `some-secret-key-123`.
4.  **Deploy**:
    *   Click **Create Web Service**.
    *   Wait for it to finish. You will get a URL like `https://itinerary-api.onrender.com`.
    *   **Copy this URL**.

---

## Phase 4: Deploy Frontend to Hostinger

Now we connect your React App to this new Render Backend.

1.  **Update API URL**:
    *   In VS Code, open `App.tsx`.
    *   Replace `http://localhost:5000/api` with your Render URL:
        ```typescript
        const API_BASE = 'https://itinerary-api.onrender.com/api'; // Use YOUR Render URL
        ```
    *   Save.

2.  **Build**:
    *   Terminal: `npm run build`.
    *   This creates the `dist` folder.

3.  **Upload to Hostinger**:
    *   Go to Hostinger **File Manager** -> **public_html**.
    *   Delete old files (`default.php`).
    *   Upload the contents of `dist` folder.
    *   **Add .htaccess**: Create a file named `.htaccess` in `public_html` and paste:
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

---

## Phase 5: Testing

1.  Visit your Hostinger Domain (`yourdomain.com`).
2.  Try logging in.
3.  If it spins or fails, check **Render Dashboard > Logs** to see if the Backend successfully connected to the Database.
    *   *Common Error*: "Access denied for user..." -> Check Hostinger "Remote MySQL" settings again.
