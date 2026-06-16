Now let's add a README.md so a new developer can orient quickly. Create it at the project root:
bashcd /d/Personal\ Projects/PricePin/presyofinder
markdown# PresyoFinder

A personal, map-based price tracker. Drop pins on stores you visit, log item prices, scan receipts, and find the cheapest place to buy what you need.

## Stack

- React + Vite
- Tailwind CSS v4
- Leaflet / react-leaflet (map)
- Supabase (auth, Postgres database, file storage)
- Tesseract.js (in-browser receipt OCR)
- vite-plugin-pwa (installable app)

## Folder structure

src/

components/

ui/ Generic reusable UI (Button, Input, Modal)

map/ Map-specific sub-components (markers, filter bar, bottom bar, trail line)

storeDetail/ Sub-components used inside the StoreDetail panel

\*.jsx Feature components (Map, AddStoreModal, StoreDetail, SearchBar, Basket, etc.)

hooks/ Custom hooks holding state + Supabase logic (useStores, useItems, useSearch, etc.)

lib/

supabase.js Supabase client init

db.js All Supabase table queries live here — components/hooks never call supabase.from() directly

toast.js Lightweight pub/sub toast notification system

mapUtils.js Pure helpers (distance calc) + Leaflet icon/color helpers

useModalKeyboard.js Hook for Escape-to-close + focus trapping in modals

pages/

Dashboard.jsx Stats screen

## Data model (Supabase)

- `stores`: id, user_id, name, type, latitude, longitude, photo_url, created_at
- `items`: id, user_id, store_id (FK → stores), name, price, recorded_at

Both tables have Row Level Security enabled — every row is scoped to `user_id = auth.uid()`.

## Key conventions

- **Never call `supabase.from(...)` directly in a component.** Add a function to `lib/db.js` and call that instead. This keeps query logic in one place.
- **State + Supabase logic belongs in a hook**, not the component. Components should mainly handle rendering and wiring callbacks.
- **Modals** use the shared `components/ui/Modal.jsx`, which includes Escape-to-close and focus trapping via `useModalKeyboard`.
- **Errors and confirmations** go through `showToast()` (`lib/toast.js`) and `useConfirmDialog()` — never `alert()` or `confirm()`.
- **Dark mode** is handled by `useDarkMode()`, which toggles a `dark` class on `<html>` and persists to `localStorage`.

## Local development

```bash
npm install
npm run dev
```

Requires a `.env` file (not committed) with:
VITE_SUPABASE_URL=...

VITE_SUPABASE_ANON_KEY=...

## Known limitations

- No automated tests yet (see `/tests` once added).
- Colored pins are canvas-generated icons (`mapUtils.js`) due to Leaflet + React divIcon bugs — don't switch back to `L.divIcon` without testing thoroughly, it breaks on marker re-render.
- Receipt OCR (`Tesseract.js`) is regex-based line parsing — works for simple receipts, not robust to unusual formats.
  Save this as README.md in the project root. Tell me when done.
