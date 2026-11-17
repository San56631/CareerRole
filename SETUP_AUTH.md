# Google sign-in + real auth setup (Supabase)

## 1. Supabase project
1. supabase.com -> New project.
2. Project Settings -> API: copy **Project URL** and **anon public key**.
3. Copy `.env.example` to `.env.local` and fill both values (plus GEMINI_API_KEY).

## 2. Google Cloud OAuth client
1. console.cloud.google.com -> APIs & Services -> OAuth consent screen (External), add app name + your email.
2. Credentials -> Create credentials -> OAuth client ID -> **Web application**.
3. **Authorized redirect URI**: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
   (Supabase -> Authentication -> Providers -> Google shows the exact URL.)
4. Copy the Client ID and Client Secret.

## 3. Enable Google in Supabase
Authentication -> Providers -> Google -> enable, paste Client ID + Secret, save.

## 4. Redirect URLs
Authentication -> URL Configuration:
- Site URL: `http://localhost:3000` (change to your Vercel URL when deployed)
- Redirect URLs: add `http://localhost:3000/auth/callback` and `https://YOUR-APP.vercel.app/auth/callback`

## 5. Email signup (optional)
Authentication -> Providers -> Email. For quick demos you can turn off
"Confirm email"; otherwise users get a confirmation link.

## 6. Run
npm install && npm run dev
