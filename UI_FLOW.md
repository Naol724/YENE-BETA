# UI flow

## `/` (Home)

- **Featured / Premium:** Loads `GET /api/houses?isPremium=true&limit=5` and displays them in a horizontal scrolling list. Clicking a card links to `/house/:id`.
- **Search Bar & See All:** Clicking the search bar or "See All" navigates the user to `/search`.
- **Recommended / Recent:** Loads `GET /api/houses?limit=8` (filtered by active category). Clicking a card links to `/house/:id`.

## `/search` (Search)

- **Initialization:** Reads `city` from URL search params to pre-fill the search term.
- **Results:** Displays properties matching the filters. Clicking a card links to `/house/:id`.
- **Filters:** Updates URL search params on submit.

## `/inquiries` (Messages)

- **Navbar:** Renters and owners reach this route from the bottom nav (messages icon).
- **List (left / mobile full width):** Loads `GET /api/inquiries/my-inquiries` (renter) or `GET /api/inquiries/received` (owner). Each row shows property thumbnail (or placeholder), counterparty or title, **last message preview** and **last activity time**, and an **unread** indicator when applicable (owner: `Pending`; renter: owner reply newer than `renterLastReadAt`).
- **Thread:** Tapping a row selects the conversation and calls **`GET /api/inquiries/:id`** (marks read server-side). Message bubbles: initial inquiry on the left; replies aligned by sender (`sender` id vs current user). Reply field is single-line with 500-char hint; submit calls **`POST /api/inquiries/:id/reply`**.
- **Polling:** While a thread is open, the client refetches `GET /api/inquiries/:id` every 20 seconds when the document is visible; refetch also runs when the window gains focus.
- **Mobile:** Back control clears the selected thread and returns to the list.

## Property detail → first message

- Renters open an inquiry modal from the property page; submit uses **`POST /api/inquiries`** then can link to `/inquiries`.
