# Custom Domain Setup Guide — ResumeAI

This guide provides step-by-step instructions for pointing a custom domain (e.g., `resumeai.dev`, `myresumes.com`, or `app.yourdomain.com`) to your deployed **ResumeAI** instance on **Vercel** and configuring **Neon Auth** for authentication.

---

## Architecture Overview

```
[ Visitor / User ]
       │
       ▼ (HTTPS / DNS Query)
[ Domain Registrar / DNS Provider ] (e.g., Cloudflare, Namecheap, GoDaddy)
       │  A Record: 76.76.21.21
       │  CNAME Record: cname.vercel-dns.com
       ▼
[ Vercel Edge Network ] (SSL Termination & Next.js App Router)
       │
       ▼ (Origin: https://yourdomain.com)
[ Neon Auth (Managed Better Auth) ] ◄── Must be in Neon Auth Trusted Domains!
       │
       ▼
[ Neon PostgreSQL ] (User and Resume storage)
```

Both **Vercel** and **Neon Auth** must be configured:
1. **Vercel** routes web traffic and automatically generates free SSL/TLS certificates via Let's Encrypt.
2. **Neon Auth** validates session cookies, CORS origins, and OAuth redirect URIs. Without registering your custom domain with Neon Auth, sign-in attempts will be rejected.

---

## Step 1: Add the Domain in Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Select your `resume_ai` project.
3. Go to **Settings** → **Domains**.
4. Enter your custom domain name:
   - For an apex domain with `www`: Enter `yourdomain.com`. Vercel will recommend adding both `yourdomain.com` and `www.yourdomain.com` with an automatic 307 redirect.
   - For a subdomain: Enter `app.yourdomain.com` or `resume.yourdomain.com`.
5. Click **Add**. Vercel will display the required DNS records.

---

## Step 2: Configure DNS Records at Your Registrar

Log in to the dashboard where you purchased or manage your domain (e.g., Cloudflare, Namecheap, GoDaddy, Porkbun, Squarespace/Google Domains).

### Option A: Apex Domain (`yourdomain.com`) + `www` Subdomain (Recommended)

Add these two DNS records in your DNS manager:

| Type | Name / Host | Target / Value | TTL | Notes |
|---|---|---|---|---|
| **A** | `@` (or leave blank) | `76.76.21.21` | Auto / 300 | Points apex to Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Auto / 300 | Points `www` to Vercel |

> [!TIP]
> **Using Cloudflare DNS?**  
> Set the proxy status to **DNS only** (gray cloud) during initial verification so Vercel can issue the Let's Encrypt certificate directly. If you enable Cloudflare proxying (orange cloud) later, ensure Cloudflare's SSL/TLS encryption mode is set to **Full (strict)**.

### Option B: Dedicated Subdomain (`app.yourdomain.com`)

If your main domain already hosts a portfolio or landing site elsewhere:

| Type | Name / Host | Target / Value | TTL |
|---|---|---|---|
| **CNAME** | `app` | `cname.vercel-dns.com.` | Auto / 300 |

---

## Step 3: Authorize Domain in Neon Auth

Neon Auth rejects any authentication request, cookie, or callback originating from an unauthorized domain. You must add your custom domain to Neon Auth's trusted domain list.

### Using the Neon CLI

From your local terminal in the project directory:

```bash
# 1. View currently trusted domains
neon neon-auth domain list

# 2. Add your custom apex domain
neon neon-auth domain add https://yourdomain.com

# 3. Add the www subdomain (if using www)
neon neon-auth domain add https://www.yourdomain.com
```

### Using the Neon Web Console

1. Open the [Neon Console](https://console.neon.tech).
2. Select your project: `resume_ai` (`sweet-glade-54193070`).
3. Select your branch: `production`.
4. In the left navigation, click **Auth**.
5. Under **Configuration** → **Authorized Redirect URLs / Trusted Domains**, click **Add Domain**.
6. Enter `https://yourdomain.com` and `https://www.yourdomain.com`.
7. Save changes.

---

## Step 4: Update Production Environment Variables (Optional)

In your **Vercel Project Settings → Environment Variables**:

1. If you configure custom metadata, Open Graph preview tags, or sitemaps, set:
   ```dotenv
   NEXT_PUBLIC_APP_URL="https://yourdomain.com"
   ```
2. Redeploy or promote the latest deployment so environment variable changes take effect.

---

## Step 5: Verification Checklist

Once DNS propagates (typically 1–15 minutes):

- [ ] **DNS Resolution**: Run `nslookup yourdomain.com` to verify it resolves to `76.76.21.21`.
- [ ] **HTTPS / SSL**: Visit `https://yourdomain.com` in your browser. Verify the padlock icon indicates a valid TLS certificate.
- [ ] **Apex / Subdomain Redirect**: Check that typing `http://yourdomain.com` redirects to `https://www.yourdomain.com` (or your preferred canonical URL).
- [ ] **Sign-In Flow**:
  1. Open an incognito browser window.
  2. Navigate to `https://yourdomain.com/login`.
  3. Sign in or register a test account.
  4. Verify you are smoothly redirected to `https://yourdomain.com/dashboard`.
- [ ] **Editor & PDF Export**:
  1. Open a resume in the editor.
  2. Verify autosave status shows "Saved" with no network or CORS errors.
  3. Click **Download PDF** and confirm the file downloads cleanly.

---

## Troubleshooting Common Issues

### 1. `Origin Not Allowed` or `Redirect URI Mismatch` Error during Sign-In
- **Cause**: The custom domain was not added to the Neon Auth trusted domain list.
- **Fix**: Run `neon neon-auth domain add https://yourdomain.com` and make sure to include the `https://` prefix without trailing slashes.

### 2. Vercel Shows "Invalid Configuration" or "Pending Certificate"
- **Cause**: DNS records have not propagated yet, or an old CAA record at your registrar is restricting Certificate Authorities.
- **Fix**: Wait a few minutes and click **Refresh** in Vercel. Ensure no CAA records restrict `letsencrypt.org`. If using Cloudflare, change the record to **DNS only** (gray cloud).

### 3. Session Expires Immediately on Page Refresh
- **Cause**: Cookie domain mismatch or HTTP instead of HTTPS.
- **Fix**: Neon Auth session cookies use the `Secure` flag and same-origin policies. Ensure all traffic is served over HTTPS.
