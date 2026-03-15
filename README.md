# WhisprAI

WhisprAI turns everyday conversations into a personalized coach for **language and culture**, building confidence in authentic cross-cultural interactions.

https://builder.aws.com/content/3AgGjGFwvBL1ue7Or1UK9DZJ7LC/aideas-whisprai

## MVP (frontend-only)

For now, the app focuses on a simple flow:

- Upload one or more **voice recordings**
- View them as separate **conversations**
- Open a conversation to see **post-conversation analysis** (placeholder text + placeholder scores)
- See a **dashboard** with placeholder trend charts (driven by your uploaded conversations)

All data is stored **locally in your browser** (metadata in `localStorage`, audio in `IndexedDB`).

## Run locally

The frontend lives in the `frontend/` folder (this repo has `frontend/` and `backend/` at the root).

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Pages

- `/`: Dashboard (KPIs + upload + placeholder trend charts)
- `/conversations`: Upload + conversation history list
- `/conversations/[id]`: Conversation detail (audio playback + placeholder analysis sections)
- `/live`: Real-time support placeholder
- `/practice`: Practice placeholder
- `/settings`: Settings placeholder
