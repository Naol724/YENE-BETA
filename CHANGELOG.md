# Changelog

## [2026-03-28] [Agent: Cursor]

- **Renter flow UX fixes**
  - Frontend: Linked property cards on Home and Search pages to `/house/:id`.
  - Frontend: Added "Premium Picks" section on Home page to display featured properties.
  - Frontend: Wired Home search bar and "See All" link to navigate to `/search`.
  - Frontend: Initialized Search page from URL search params (`city`) and synced params on filter apply.
  - Frontend: Removed hardcoded "12 Reviews" and "Superhost" from `PropertyDetails.tsx`.
  - Docs: Updated `UI_FLOW.md` to document Home and Search page flows.

## [2026-03-28] [Agent: Cursor]

- **Inquiries / customer–owner messaging**
  - Backend: `GET /api/inquiries/:id` returns a single thread for the renter or owner; opening the thread updates read state (`Pending` → `Read` for owners, `renterLastReadAt` for renters). New fields on `Inquiry`: `renterLastReadAt`, `ownerLastReadAt`.
  - Backend: Reply body validated (non-empty, max 500 characters); reply subdocuments enforce `minlength`/`maxlength`; `POST /api/inquiries/:id/reply` responds with a populated inquiry document.
  - Frontend: Messages page loads the full thread via `GET` when a conversation is selected; list rows show last message preview and time; unread dot and emphasis for owners (`Pending`) and renters (owner reply after last read); polling every 20s while a thread is open (paused when the tab is hidden); `sender` IDs normalized for correct bubble alignment.
  - Frontend: Inquiry API helpers and types in `frontend/src/services/inquiries.ts`.
  - Docs: `API_DOCS.md` (inquiry endpoints), `UI_FLOW.md` (`/inquiries`), this changelog; README subsection for messaging.
