# Charly - Secure Chat Platform

Production-ready web application built with React, Vite, Tailwind CSS, and Supabase authentication.

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Routing**: react-router-dom
- **Auth & Database**: Supabase (Email OTP only)
- **Hosting**: Vercel

## Features

- Secure email OTP authentication (6-digit code, 5-minute expiry)
- Whitelist-based access control
- User profile management
- Activity tracking (login/logout sessions)
- Row-level security (RLS) for data protection
- Clean, responsive UI with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)

## Local Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy your:
   - Project URL
   - `anon` public key

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Supabase Database

1. Go to **SQL Editor** in your Supabase dashboard
2. Open `supabase/bootstrap.sql` and copy the entire contents
3. Paste into the SQL Editor and click **Run**
4. The script will create:
   - Tables: `allowed_users`, `profiles`, `user_activity`
   - RLS policies
   - RPC functions
   - Indexes

### 5. Configure Supabase Auth

In your Supabase dashboard:

1. Go to **Authentication > Settings**
2. Find **Email Auth** and enable **Email OTP**
3. Configure settings:
   - OTP Type: `6 digits`
   - OTP Expiry: `300` seconds (5 minutes)
4. Scroll down to **Email Templates** and customize if needed

### 6. Seed Allowed Users

Add authorized email addresses to the whitelist:

```sql
INSERT INTO public.allowed_users (email, note) VALUES
  ('your-email@example.com', 'Primary admin'),
  ('another-email@example.com', 'Team member');
```

Replace with your actual email addresses.

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Vercel Deployment

### 1. Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 2. Deploy to Vercel

Option A: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your Git repository
4. Configure build settings (auto-detected)

Option B: Using CLI
```bash
vercel
```

### 3. Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings > Environment Variables**
2. Add the following:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
3. Click **Save** and redeploy

### 4. Deploy

Vercel will automatically redeploy. Your app will be live!

## Project Structure

```
src/
  pages/
    Login.jsx           # Email OTP authentication flow
    DashboardLayout.jsx  # Main layout with sidebar
    Chat.jsx            # Chat dashboard (placeholder)
    Profile.jsx         # User profile management
    Reporting.jsx       # Reporting dashboard (placeholder)
    Training.jsx        # Training center (placeholder)
  supabaseClient.js    # Supabase client configuration
  App.jsx              # Main router and route guards
  main.jsx             # App entry point
  index.css            # Tailwind CSS imports

supabase/
  bootstrap.sql        # Database schema and setup

.env.example          # Environment variables template
```

## Authentication Flow

### Login Process

1. User enters email
2. System checks `is_email_allowed()` RPC function
3. If not whitelisted: show "You are not authorized"
4. If whitelisted: send 6-digit OTP to email
5. User enters OTP code
6. On successful verification:
   - Call `ensure_profile()` to create/update profile
   - Call `log_login()` to record session
   - Redirect to `/chat` dashboard

### Logout Process

1. User clicks logout button
2. Call `log_logout()` to timestamp the session
3. Sign out via Supabase
4. Redirect to `/login`

## Database Schema

### Tables

**allowed_users** (Private)
- `email` (citext, PK): Whitelisted email addresses
- `note` (text): Optional description
- `created_at` (timestamptz): Creation timestamp

**profiles** (RLS-protected)
- `id` (uuid, PK): References auth.users.id
- `email` (citext, unique): User email
- `full_name` (text): User's full name
- `avatar_url` (text): Optional avatar URL
- `created_at` (timestamptz): Creation timestamp

**user_activity** (RLS-protected)
- `id` (bigserial, PK)
- `user_id` (uuid): References auth.users.id
- `email` (citext): User email at login
- `session_id` (text, unique): Session identifier
- `login_time` (timestamptz): Login timestamp
- `logout_time` (timestamptz): Logout timestamp
- `user_agent` (text): Browser/client info
- `created_at` (timestamptz): Creation timestamp

### Row-Level Security (RLS)

- `profiles`: Users can only access their own profile
- `user_activity`: Users can only view/modify their own activity
- `allowed_users`: No public access (only via RPC)

### Functions

**public.is_email_allowed(e text)**
- Checks if email is whitelisted (case-insensitive)
- Available to `anon` and `authenticated`

**public.ensure_profile()**
- Creates profile row if missing
- Uses current authenticated user
- Available to `authenticated` only

**public.log_login(p_session_id text, p_user_agent text)**
- Records login activity
- Available to `authenticated` only

**public.log_logout(p_session_id text)**
- Records logout timestamp
- Available to `authenticated` only

## Usage Examples

### Checking Email Authorization

```javascript
const { data: isAllowed } = await supabase
  .rpc('is_email_allowed', { e: 'user@example.com' })

if (!isAllowed) {
  console.log('Not authorized')
}
```

### Logging User Activity

```javascript
const { data: { session } } = await supabase.auth.getSession()

// On login
await supabase.rpc('log_login', {
  p_session_id: session.access_token,
  p_user_agent: navigator.userAgent
})

// On logout
await supabase.rpc('log_logout', {
  p_session_id: session.access_token
})
```

## Security Considerations

1. **RLS**: All tables use Row-Level Security to prevent unauthorized access
2. **Whitelist**: Only authorized emails can request OTP codes
3. **Session Tracking**: All login/logout events are recorded
4. **Security Definer**: RPC functions run with elevated privileges only when necessary
5. **Case-Insensitive**: Uses `citext` for emails to avoid case-sensitivity issues

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists with correct values
- Restart dev server after adding env vars

### "You are not authorized"
- Add your email to `allowed_users` table in Supabase

### "Invalid or expired code"
- Check email spam folder
- Request a new code (codes expire after 5 minutes)

### RLS Policy Issues
- Verify bootstrap.sql ran successfully
- Check Supabase logs for policy errors

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
