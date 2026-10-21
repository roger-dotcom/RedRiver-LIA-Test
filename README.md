# RedRiver LIA Test

A full-stack book management application built with Angular 20 and ASP.NET Core 9 as part of a frontend development internship (LIA) technical assessment.

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

- Display books retrieved from the backend API
- User login with JWT authentication
- Add new books
- Edit existing books
- Delete books
- Restrict book management actions to authenticated users
- Angular route guards for protected pages
- Responsive user interface

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

Configure the JWT signing key using .NET User Secrets. Do not commit secret keys to Git.

### Frontend

Requires Node.js and npm.

```powershell
cd redriver-client
npm install
npm start
```

Open http://localhost:4200 in your browser.

The backend API must be running for the frontend to retrieve and manage books.

## Deployment

- Source code: GitHub
- Frontend deployment: Vercel (planned)
- Backend deployment: To be configured

## Purpose

This project demonstrates full-stack development, API integration, authentication, routing, and CRUD operations using Angular and ASP.NET Core.
