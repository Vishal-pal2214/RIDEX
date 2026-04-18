# RideX

RideX is a full-stack ride booking app with an Express/MongoDB backend and a React/Vite frontend.

## Local setup

1. Install dependencies:
   - `npm run install:all`
2. Copy env files:
   - `cp Backend/.env.example Backend/.env`
   - `cp Frontend/.env.example Frontend/.env`
3. Update the env values:
   - `Backend/.env`: set `DB_CONNECT`, `JWT_SECRET`, and optionally `GOOGLE_MAPS_API`
   - `Frontend/.env`: set `VITE_GOOGLE_MAPS_API_KEY` if you want live maps
4. Start both apps:
   - `npm run dev`

## Production / deployment

1. Install dependencies:
   - `npm run install:all`
2. Build the frontend:
   - `npm run build`
3. Start the backend:
   - `npm start`

In production, the backend serves the built frontend from `Frontend/dist`, so you can deploy the project as a single Node service.

## Default URLs

- Frontend dev server: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`
- Health check: `http://localhost:3000/health`
