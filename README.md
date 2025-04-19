# Deno Fresh + Strapi Profile Editor

A web application with Deno Fresh (frontend) and Strapi (backend) featuring user authentication and an Editor.js profile editor.

## Features

- User authentication with email/password
- Social login (Google, Facebook)
- Rich text profile editor with Editor.js
- Tailwind CSS styling

## Setup Instructions

### 1. Strapi Backend Setup

```bash
mkdir backend
cd backend
npx create-strapi-app@latest ./ --quickstart
npm run develop
```

#### Configure User Profile

- In Content-Type Builder, create "Profile" collection type with bio (Rich Text)

#### Configure Permissions

- Go to Settings > Users & Permissions Plugin > Roles > Authenticated
- Enable "update" permission for User

### 2. OAuth Configuration

#### Google OAuth Setup

- Go to Google Cloud Console
- Create OAuth client ID (Web application)
- Add redirect URIs (for development): `http://localhost:8000`

#### Configure in Strapi

- Settings > Users & Permissions Plugin > Providers
- Configure Google:
  - Enable: Yes
  - Client ID: Your Google OAuth client ID
  - Client Secret: Your Google OAuth client secret
  - Callback URL: `http://localhost:1337/api/connect/google/callback`

## Running the Application

- Start Strapi: `npm run develop` (in backend directory)
- Start Deno Fresh: `deno task start` (in frontend directory)
- Access at `http://localhost:8000`
