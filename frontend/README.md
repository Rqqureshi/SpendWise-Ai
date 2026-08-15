Frontend setup

- Set the backend base URL with the Vite environment variable `VITE_API_URL`.
  - Example development: `VITE_API_URL=http://127.0.0.1:8000 npm run dev`
  - Or create a `.env` file in `frontend/` with: `VITE_API_URL=http://127.0.0.1:8000`
- When unset, the app falls back to `http://127.0.0.1:8000`.
- `frontend/src/config.js` centralizes the base URL and is the single place used by the frontend API calls.
