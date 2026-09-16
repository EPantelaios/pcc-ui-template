# Frontend foundation

A ready-to-use starting point for new **React** frontend projects, built and maintained by **GRNET**.

---

## What is this repository

This repository is a **template**, not a real application. It exists so that when we start a new frontend project, we don't have to set up authentication, API calls, and the basic page layout from scratch every time.

It already has the parts that almost every project needs: login with **Keycloak**, a pattern for calling a backend API, a small set of ready-made reusable UI components, and a basic page layout with a sidebar. When you start a new project, you can clone this repo and build your actual features on top of it.

---

## What's inside

### Core packages

| Package                          | What it's for                                             |
| -------------------------------- | --------------------------------------------------------- |
| **React 19** + **TypeScript**    | The UI library and language                               |
| **Vite**                         | Dev server and build tool                                 |
| **Tailwind CSS** + **DaisyUI**   | CSS framework and Tailwind components for styling         |
| **TanStack React Query**         | Fetching and caching data from the backend API            |
| **keycloak-js**                  | Handles authentication and authorization through Keycloak |
| **react-router-dom**             | Page routing                                              |
| **Heroicons** / **Lucide React** | Icons                                                     |

### Project structure

```text
src/
  api/          One file per backend domain — plain async functions that call the backend API with fetch()
  hooks/        TanStack Query wrappers around the api/ functions
  auth/         Keycloak login setup and the useAuth() hook
  routing/      AuthProtected — wraps pages that need a logged-in user
  components/   Reusable UI pieces (buttons, tables, dialogs, sidebar, ...)
  pages/        One file per page/route
  types/        TypeScript types for API data
  Layout.tsx    The page shell (sidebar + main content area)
  App.tsx       Routes are defined here
```

### Authentication and Authorization with Keycloak (RCIAM)

This template project is set up to work with **RCIAM**, our identity provider at GRNET. RCIAM (Identity Access Management for Research Communities) extends Keycloak to support federated authentication and advanced group management.

For authentication, the app uses Keycloak's **PKCE** login flow — the standard, secure way for a browser app to log in without needing a secret password stored in the code. When a user logs in, Keycloak sends back a token, and that token is attached to every backend API request (as a `Bearer` token) to prove who the user is.

The important files are:

- `src/auth/keycloak.ts` — sets up the connection to Keycloak using the values from your `.env` file
- `src/auth/AuthProvider.tsx` — handles login, logout, and keeping your session token fresh
- `src/auth/useAuth.ts` — the hook you use anywhere in the app to check `authenticated`, get the current `token`, or call `login()`/`logout()`

The Keycloak connection details (server URL, realm, client ID) are not hardcoded — they come from environment variables, so the same code works whether you point it at RCIAM, a different Keycloak, or a local test instance. See [Environment variables](#environment-variables) below.

### How to add a new API endpoint

Every backend call follows the same two-step pattern: a plain function in `api/`, and a hook in `hooks/` that wraps it with React Query.

**Step 1 — add the API function** (`src/api/projects.ts`):

```ts
import type { Project } from '@/types/projects'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchProjects = async (token: string): Promise<Project[]> => {
  const response = await fetch(`${BACKEND_API}/projects`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message ?? `HTTP error! status: ${response.status}`,
    )
  }

  return (await response.json()) as Project[]
}
```

On the backend side, our APIs validate this `Bearer` token and check the user's permissions using **[quarkus-auth](https://github.com/ARGOeu/quarkus-auth)**, our internal Quarkus library for OIDC authentication and entitlement-based authorization.

**Step 2 — add the hook** (`src/hooks/useProjects.ts`):

```ts
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import { fetchProjects } from '@/api/projects'
import type { Project } from '@/types/projects'

export const useGetProjects = () => {
  const { token } = useAuth()

  return useQuery<Project[], Error>({
    queryKey: ['projects'],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchProjects(token)
    },
    retry: false,
    enabled: !!token,
  })
}
```

**Step 3 — use it in a component:**

```tsx
const { data: projects, isLoading, error } = useGetProjects()
```

Look at `src/api/profile.ts` and `src/hooks/useProfile.ts` for a real, working example already in the repo.

### How to add a new page (example: a user profile page)

**Step 1 — create the page** (`src/pages/Profile.tsx`):

```tsx
import { useGetUserProfile } from '@/hooks/useProfile'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'

const Profile = () => {
  const { data: profile, isLoading, error } = useGetUserProfile()

  return (
    <div className="page-container">
      <h1 className="text-xl font-bold text-foreground">Profile</h1>

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <ErrorDisplay error={error} context="profile" />
      ) : (
        <p className="text-body">{profile?.username}</p>
      )}
    </div>
  )
}

export default Profile
```

**Step 2 — add the route** (in `src/App.tsx`), wrapped in `AuthProtected` so only logged-in users can see it:

```tsx
import Profile from '@/pages/Profile'
import AuthProtected from '@/routing/AuthProtected'

return (
  <Routes>
    {/* ...existing routes... */}
    <Route
      path="profile"
      element={
        <AuthProtected>
          <Profile />
        </AuthProtected>
      }
    />
  </Routes>
)
```

Now the new page shows up at `/profile`, and reuses the same login check, layout, and loading/error components as the rest of the app.

---

## Instructions for Developers

### Prerequisites

Make sure you have the following installed:

- **Node.js** version 22 or later (this repo is tested with **v24**, the latest LTS version and the recommended version for now — see the `.nvmrc` file)
- Access to a **Keycloak** instance (e.g. RCIAM Keycloak)
- A running backend API to point the app at

If you use `nvm`, running this in the project folder will switch you to the right Node version automatically:

```bash
nvm use
```

---

### Clone and install

```bash
git clone https://github.com/ARGOeu/frontend-foundation.git
cd frontend-foundation
npm install
```

---

### Start the app

```bash
npm run dev
```

The app will be available at:

```text
http://localhost:5173
```

---

### Test your changes

Before committing, check that formatting, linting, and the build are all still clean:

```bash
npm run prettier && npm run lint && npm run build
```

---

### Environment variables

Copy `.env.development` and update it with your own values:

```bash
VITE_KEYCLOAK_URL=http://localhost:58080
VITE_KEYCLOAK_REALM=your-realm
VITE_KEYCLOAK_CLIENT_ID=your-client-id
VITE_KEYCLOAK_SCOPE="openid profile email"
VITE_REDIRECT_URI=http://localhost:5173
VITE_BACKEND_URI=http://localhost:8080
```

| Variable                  | What it means                             |
| ------------------------- | ----------------------------------------- |
| `VITE_KEYCLOAK_URL`       | Address of your Keycloak server           |
| `VITE_KEYCLOAK_REALM`     | The Keycloak realm to log in against      |
| `VITE_KEYCLOAK_CLIENT_ID` | The Keycloak client ID for this app       |
| `VITE_KEYCLOAK_SCOPE`     | OAuth scopes requested at login           |
| `VITE_REDIRECT_URI`       | Where Keycloak sends you back after login |
| `VITE_BACKEND_URI`        | Base URL of the backend API               |
