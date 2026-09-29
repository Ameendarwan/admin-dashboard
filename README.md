# Merit Admin Dashboard

This is a **Next.js** project for the Merit Admin Dashboard, built with **TypeScript**, **Tailwind CSS**, and other modern web development tools.

## Features

### Prerequisites

Make sure you have the following installed:

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://<username>@bitbucket.org/tintash/merit-admin-portal.git
   cd merit-admin-portal
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Technologies Used

- **Next.js**: Framework for building React applications.
- **TypeScript**: For type safety and better developer experience.
- **Tailwind CSS**: For styling the application.
- **ESLint & Prettier**: For linting and formatting.

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint to check for code issues.

# Project Structure & Routing Guide

## 📁 Folder Structure

```
src/app/
│
├── (auth)/                # Public authentication routes
│   ├── login/
│   │   └── page.tsx       # Login page
│   ├── signup/
│   │   └── page.tsx       # Signup page
│   └── layout.tsx         # Auth layout (redirects authenticated users to dashboard)
│
├── (protected)/           # Protected routes (require authentication)
│   ├── dashboard/
│   │   └── page.tsx       # Dashboard page
│   └── layout.tsx         # Protection logic (redirects unauthenticated users to login)
│
├── contexts/
│   └── auth-context.tsx   # Authentication state management
│
├── layout.tsx             # Root layout (global providers)
├── page.tsx               # Public landing page
└── globals.css            # Global styles
```

## 🔒 Route Protection

### **How It Works**

- **Protected routes** (`/dashboard`, etc.) → Redirect to `/login` if not authenticated
- **Auth routes** (`/login`, `/signup`) → Redirect to `/dashboard` if already authenticated
- **Public routes** (`/`) → No restrictions

### **Adding New Pages**

- **Protected page**: Create inside `src/app/(protected)/` (e.g., `src/app/(protected)/profile/page.tsx`)
- **Public page**: Create directly under `src/app/` (e.g., `src/app/about/page.tsx`)

## 🧑‍💻 Authentication

- Uses **Firebase Auth** + **sessionStorage** for state management
- Access auth state via `useAuth()` hook: `{ user, isAuthenticated, isLoading, login, logout }`
- **Never store auth state in cookies/localStorage** (use sessionStorage only)

## 🛠️ For Developers

- **Update auth logic**: `src/app/contexts/auth-context.tsx`
- **Update protection logic**: `src/app/(protected)/layout.tsx`
- **Add protected routes**: Inside `(protected)` group
- **Add public routes**: Outside `(protected)` group

---

**Note**: This project uses client-side authentication. Middleware cannot access Firebase/sessionStorage, so route protection is handled in layouts.
