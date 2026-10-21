# RedRiver LIA Test

A full-stack book management application built with Angular 20 and ASP.NET Core 9 as part of a frontend development internship (LIA) technical assessment.

## Live Application

- **Frontend:** https://red-river-lia-test.vercel.app
- **Backend API:** https://redriver-lia-test.onrender.com/api/books
- **GitHub:** https://github.com/roger-dotcom/RedRiver-LIA-Test

## Tech Stack

### Frontend

- Angular 20
- TypeScript
- HTML and SCSS
- Bootstrap

### Backend

- ASP.NET Core 9
- C#
- REST API
- JWT authentication

## Features

- View books retrieved from the backend API
- Register a new user account
- Log in and log out using JWT authentication
- Add, edit and delete books
- View favorite quotes
- Add, edit and delete quotes
- Restrict management actions to authenticated users
- Navigation between application sections
- Responsive design for desktop and mobile

## Project Structure

```text
RedRiver-LIA-Test/
├── redriver-client/   # Angular frontend
├── RedRiver.Api/      # ASP.NET Core backend
└── README.md
```

## Running Locally

### Backend

Requires .NET 9 SDK.

```powershell
cd RedRiver.Api
dotnet run
```

Configure the JWT signing key securely using .NET User Secrets or environment variables. Do not commit secret keys to Git.

### Frontend

Requires Node.js and npm.

```powershell
cd redriver-client
npm install
npm start
```

Open http://localhost:4200 in your browser.

The backend API must be running for the frontend to retrieve and manage data.

## Deployment

- Frontend hosted on Vercel
- Backend hosted on Render
- Source code hosted on GitHub

The frontend communicates with the deployed REST API. The Render free service may take some time to respond after inactivity.

**Note:** Books, quotes and registered users are currently stored in memory. Changes are reset when the backend restarts.

## Purpose

This project demonstrates frontend and backend development, REST API integration, JWT authentication, user registration, responsive design and CRUD operations using Angular and ASP.NET Core.
