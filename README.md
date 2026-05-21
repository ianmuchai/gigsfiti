# Gig Fiti

Gig Fiti is a full-stack prototype for a KES-based gig-matching marketplace. It includes a Node backend API, a multi-page single-page app, live worker matching, job posting, messages, and a hiring dashboard.

## Project Structure

- `server.js` serves the app and provides API routes for categories, workers, jobs, messages, matching, and worker contact.
- `api/index.js` mirrors the backend API for Vercel serverless deployment.
- `public/index.html` contains the app shell and page views.
- `public/styles.css` contains the visual design and responsive layout.
- `public/app.js` contains client-side routing, API calls, matching UI behavior, job submission, and contact actions.
- `vercel.json` contains the existing Vercel project metadata.

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Deploy

This project uses `server.js` locally and `api/index.js` on Vercel. Push to GitHub, then redeploy the linked Vercel project so `/api/*` routes are served by the serverless function.

## Share For Feedback

Once deployed, you can send your Vercel production URL or preview URLs to partners so they can review the prototype and suggest improvements.
