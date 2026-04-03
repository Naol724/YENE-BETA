# API — Inquiries (customer–owner chat)

Base path: `/api/inquiries` (requires `Authorization: Bearer <token>` unless noted).

## POST `/`

Create an inquiry (initial message). **RENTER** only.

**Body (JSON):**

| Field       | Type   | Required | Notes                          |
|------------|--------|----------|--------------------------------|
| `property` | string | yes      | House `_id`                    |
| `message`  | string | yes      | 10–500 characters              |

**Responses:** `201` `{ success, data }` — inquiry document; `400` validation / max inquiries per property; `404` property not found.

---

## GET `/my-inquiries`

List inquiries for the current user. **RENTER** only.

**Response:** `200` `{ success, count, data: Inquiry[] }`

---

## GET `/received`

List inquiries received by the current user. **OWNER** only.

**Response:** `200` `{ success, count, data: Inquiry[] }`

---

## GET `/:id`

Single inquiry thread. Caller must be the **renter** or **owner** on that inquiry.

**Side effects:**

- If caller is **owner** and `status === 'Pending'`, sets `status` to `'Read'`.
- Sets `ownerLastReadAt` or `renterLastReadAt` to the current time for the caller.

**Response:** `200` `{ success, data }` — populated `property`, `owner`, `renter`, `replies.sender` (partial user fields).

**Errors:** `403` not a participant; `404` not found.

---

## PATCH `/:id`

Update inquiry `status`. **OWNER** only.

**Body:** `{ "status": "Read" | "Responded" | "Pending" }` (optional; defaults to `Read`).

---

## POST `/:id/reply`

Append a reply. **Renter or owner** on that inquiry.

**Body:** `{ "message": string }` — required, non-empty after trim, max 500 characters.

**Status updates:** owner reply → `Responded`; renter reply → `Pending`.

**Response:** `200` `{ success, data }` — fully populated inquiry (same shape as `GET /:id`).

**Errors:** `400` empty/too long message; `403` not a participant; `404` not found.

---

## Inquiry model (relevant fields)

| Field               | Type     | Notes                                                |
|---------------------|----------|------------------------------------------------------|
| `property`          | ObjectId | ref House                                            |
| `renter` / `owner`  | ObjectId | ref User                                             |
| `message`           | string   | Initial message (10–500)                             |
| `status`            | string   | `Pending`, `Read`, `Responded`                       |
| `renterLastReadAt`  | Date     | Last time renter opened thread via `GET /:id`        |
| `ownerLastReadAt`   | Date     | Last time owner opened thread via `GET /:id`         |
| `replies`           | array    | `{ sender, message (1–500), createdAt }`             |
| `createdAt` / `updatedAt` | Date | timestamps                                   |
