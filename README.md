# Gig Fiti

Gig Fiti is a frontend prototype for a gig-matching marketplace. It demonstrates a landing page plus a live matching experience that ranks workers by category, budget, distance, ratings, and skill fit.

## Project Structure

- `public/index.html` contains the page structure.
- `public/styles.css` contains the visual design and responsive layout.
- `public/app.js` contains the matching logic and UI behavior.
- `server.js` is a small local Node server for previewing the app.
- `vercel.json` configures static deployment on Vercel.

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Deploy To Vercel

This project is configured as a static Vercel deployment using the `public` directory as the output.

### Vercel Import Settings

- Framework Preset: `Other`
- Build Command: leave empty
- Output Directory: `public`

If Vercel detects the settings automatically from `vercel.json`, you can keep the defaults it shows.

## Share For Feedback

Once deployed, you can send your Vercel production URL or preview URLs to partners so they can review the prototype and suggest improvements.
