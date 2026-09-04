Date created: September 4, 2026
Date last modified: September 4, 2026 (preview question UI added)

# Multiple Choice Questions (MCQ) CRUD — Technical PRD

## Overview/Problem

Sprint 0 delivered authentication: users can sign up, sign in, and reach a protected Dashboard placeholder. That page confirms identity but offers no quiz functionality. Educators and trainers using Quiz Maker need to create, view, edit, and delete multiple choice questions before quizzes can be assembled or attempted.

Without MCQ management, there is no content layer for the product. Users cannot define questions, configure answer choices, or record practice attempts. This sprint adds a dedicated MCQ management page at `/mcqs` (list, create, edit) backed by a persistent D1 schema, a service layer, API routes, and a shadcn/ui interface built with test-driven development. The Dashboard remains a lightweight authenticated landing page with navigation to MCQ management.

---

## Hypothesis

We believe that delivering authenticated CRUD for multiple choice questions—with a list view, create/edit form, choice management (2–6 options), preview/take flow, and attempt recording—will give Quiz Maker its first content capability so users can build and track question-level interactions before full quiz assembly ships in a later sprint.

---

## Scope

### In Scope

- D1 database schema: `mcq`, `mcq_choice`, and `mcq_attempt` tables with migrations
- MCQ service layer in `src/lib/` (database access abstracted from routes and UI)
- REST API routes for MCQ CRUD and attempt recording
- Dedicated MCQ list page at `/mcqs` with shadcn `Table`
- Dashboard updated with a link to `/mcqs` (Dashboard itself is not the MCQ list)
- Create MCQ page (`/mcqs/new`) and edit MCQ page (`/mcqs/[id]/edit`) sharing one form
- Preview MCQ page (`/mcqs/[id]/preview`) to try answering a question and record an attempt
- Row actions via vertical-ellipsis dropdown (Edit, Preview, Delete)
- Choice editor: 2 choices shown by default, user can add up to 6, user can remove down to 2
- Exactly one choice marked as correct per question
- Ownership: users see and manage only MCQs they created (`created_by_user_id`)
- Server-side validation with shared validation module; client-side validation for immediate feedback (matches Sprint 0 auth pattern; Zod deferred — see Cut)
- Test-driven development for validation, service layer, API routes, and key UI behaviour
- Extend route protection to cover all new MCQ routes

### Out of Scope

- Full quiz assembly (grouping multiple MCQs into a quiz)
- Quiz-taking UI with timer, scoring dashboard, or leaderboards
- Sharing MCQs between users or public question banks
- AI-powered question generation
- Rich text or image attachments on questions or choices
- Drag-and-drop choice reordering (display order uses explicit `sort_order`; manual reorder UI deferred)
- Bulk import/export of questions
- Pagination (acceptable for Sprint 2 if question count is small; add when list grows)
- Role-based access (admin vs. user)

### Cut

| Item | Reason for cutting |
|------|-------------------|
| Drizzle ORM for MCQ tables | Sprint 2 uses raw D1 prepared statements via service layer, matching `src/lib/db/users.ts`. Drizzle can be introduced when quiz schema grows. |
| Server Actions instead of API routes | Project convention prefers Server Actions for form mutations; this sprint explicitly requires HTTP API routes for MCQ and attempts to establish a reusable endpoint layer. |
| Attempt-taking UI page | Attempts table and `POST` API are in scope; a dedicated preview page at `/mcqs/[id]/preview` lets owners try their question and records an attempt. Full quiz-taking UI with timer/scoring dashboard remains deferred. |
| Soft delete / archive | Hard delete with cascade is sufficient for Sprint 2. |
| Zod for MCQ validation | Sprint 0 uses hand-written validation in `src/lib/auth/validation.ts`; MCQ follows the same pattern in `src/lib/mcq/validation.ts` to avoid a new dependency |
| Question categories or tags | Not needed to prove CRUD. |

---

## User Flow

### MCQ List Flow

1. Authenticated user navigates to `/mcqs` (from Dashboard link or direct URL).
2. System loads all MCQs created by the current user.
3. User sees a table with columns: Name, Question (truncated if long), and Actions.
4. User clicks **Create question** → navigates to `/mcqs/new`.
5. User clicks the vertical-ellipsis (⋮) on a row → dropdown shows **Edit**, **Preview**, and **Delete**.
6. **Edit** → navigates to `/mcqs/[id]/edit`.
7. **Preview** → navigates to `/mcqs/[id]/preview`.
8. **Delete** → confirmation dialog → on confirm, MCQ and its choices are removed → table refreshes.

### Create MCQ Flow

1. User lands on `/mcqs/new`.
2. Form shows fields: Name, Question, and 2 empty choice rows (each with choice text and a "correct" indicator).
3. User fills fields; can click **Add choice** until 6 choices exist.
4. User can remove choices down to the minimum of 2.
5. User marks exactly one choice as correct.
6. User clicks **Save** → validation runs → on success, redirect to `/mcqs` with the new question listed.
7. User clicks **Cancel** → return to `/mcqs` without saving.

### Edit MCQ Flow

1. User opens `/mcqs/[id]/edit` from the list actions menu.
2. Form is pre-populated with existing name, question, and choices.
3. User modifies fields and clicks **Save** → validation → update persisted → redirect to `/mcqs`.
4. User clicks **Cancel** → return to `/mcqs` without saving.
5. If the MCQ does not exist or belongs to another user → show not-found or forbidden behaviour.

### Preview MCQ Flow

1. User opens `/mcqs/[id]/preview` from the list actions menu.
2. Page shows the question name, full question text, and answer choices as radio buttons (no correct answer revealed).
3. User selects a choice and clicks **Submit answer**.
4. Server records an attempt via `POST /api/mcqs/[id]/attempts` and returns whether the answer was correct.
5. UI shows **Correct!** or **Incorrect.** feedback; further submissions are disabled for that visit.
6. User clicks **Back to questions** → returns to `/mcqs`.
7. If the MCQ does not exist or belongs to another user → show not-found behaviour.

### Record Attempt Flow (API and Preview UI)

1. Client (or test harness) sends `POST /api/mcqs/[id]/attempts` with `selectedChoiceId`.
2. Server verifies the MCQ exists, the choice belongs to that MCQ, and the caller is authenticated.
3. Server records `mcq_attempt` with `is_correct` derived from the choice's `is_correct` flag.
4. Response returns attempt id and whether the answer was correct.

### Navigation Flow Summary

```
Dashboard (/dashboard)
    └── Manage questions link ──► /mcqs (MCQ list)
                                      │
                                      ├── Create question ──► /mcqs/new ──(Save)──► /mcqs
                                      │                   └── (Cancel) ──────────► /mcqs
                                      │
                                      └── Row ⋮ menu
                                              ├── Edit ──► /mcqs/[id]/edit ──(Save)──► /mcqs
                                              │                              └── (Cancel) ──► /mcqs
                                              ├── Preview ──► /mcqs/[id]/preview ──(Submit)──► attempt recorded
                                              │                              └── (Back) ──► /mcqs
                                              └── Delete ──(confirm)──► /mcqs (row removed)

Unauthenticated user ──► /dashboard or /mcqs/* ──► Redirect to /sign-in
```

---

## User Stories

### MCQ List

| ID | Story | Priority |
|----|-------|----------|
| US-01 | As a signed-in user, I want a dedicated page at `/mcqs` listing my multiple choice questions so that I can manage my content. | Must Have |
| US-02 | As a signed-in user, I want a **Create question** button on the MCQ list page so that I can add new questions. | Must Have |
| US-03 | As a signed-in user, I want row actions (Edit, Preview, Delete) in a dropdown menu so that I can manage each question without cluttering the table. | Must Have |
| US-04 | As a signed-in user, I want to confirm before deleting a question so that I do not delete by accident. | Must Have |

### MCQ Create / Edit

| ID | Story | Priority |
|----|-------|----------|
| US-05 | As a signed-in user, I want to create a question with a name, question text, and 2–6 choices so that I can define a multiple choice item. | Must Have |
| US-06 | As a signed-in user, I want to mark exactly one choice as correct so that attempts can be scored. | Must Have |
| US-07 | As a signed-in user, I want to edit an existing question and its choices so that I can fix mistakes. | Must Have |
| US-08 | As a signed-in user, I want **Save** and **Cancel** buttons so that I can commit or discard changes. | Must Have |
| US-09 | As a signed-in user, I want clear validation errors when my input is invalid so that I can correct it. | Must Have |

### MCQ Attempts

| ID | Story | Priority |
|----|-------|----------|
| US-10 | As a signed-in user, I want to record an attempt against a question via the API so that my selected answer and correctness are stored. | Must Have |
| US-13 | As a signed-in user, I want to preview a question and try answering it so that I can verify how it will appear to respondents. | Must Have |
| US-14 | As a signed-in user, I want my preview attempt recorded when I submit an answer so that I can track practice interactions. | Must Have |

### Access Control

| ID | Story | Priority |
|----|-------|----------|
| US-11 | As a signed-in user, I should only see and modify MCQs I created, not other users' questions. | Must Have |
| US-12 | As an unauthenticated visitor, I should be redirected to Sign In when accessing MCQ pages or APIs. | Must Have |

---

## Technical Requirements

### Database Schema

Three new tables. IDs use the same pattern as Better Auth tables: `TEXT PRIMARY KEY` with application-generated UUIDs (or `lower(hex(randomblob(16)))` if generated in SQL).

```sql
-- Migration: 0002_mcq_tables.sql (name finalized during implementation)

CREATE TABLE mcq (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  question TEXT NOT NULL,
  created_by_user_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_mcq_created_by_user_id ON mcq (created_by_user_id);

CREATE TABLE mcq_choice (
  id TEXT PRIMARY KEY NOT NULL,
  mcq_id TEXT NOT NULL REFERENCES mcq (id) ON DELETE CASCADE,
  choice_text TEXT NOT NULL,
  is_correct INTEGER NOT NULL DEFAULT 0 CHECK (is_correct IN (0, 1)),
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_mcq_choice_mcq_id ON mcq_choice (mcq_id);

CREATE TABLE mcq_attempt (
  id TEXT PRIMARY KEY NOT NULL,
  mcq_id TEXT NOT NULL REFERENCES mcq (id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  selected_choice_id TEXT NOT NULL REFERENCES mcq_choice (id) ON DELETE CASCADE,
  is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_mcq_attempt_mcq_id ON mcq_attempt (mcq_id);
CREATE INDEX idx_mcq_attempt_user_id ON mcq_attempt (user_id);
```

#### Column notes

| Table | Column | Purpose |
|-------|--------|---------|
| `mcq` | `name` | Short label for list display and identification |
| `mcq` | `question` | Full question prompt shown when taking or editing |
| `mcq` | `created_by_user_id` | Owner; enforces per-user isolation |
| `mcq_choice` | `is_correct` | `1` for the single correct answer, `0` otherwise |
| `mcq_choice` | `sort_order` | Display order (0-based or 1-based; pick one and use consistently) |
| `mcq_attempt` | `selected_choice_id` | The choice the user picked |
| `mcq_attempt` | `is_correct` | Denormalized result at attempt time |

---

### API Endpoints

All endpoints require an authenticated session. Unauthenticated requests return `401 Unauthorized`. Requests for MCQs not owned by the caller return `404 Not Found` (do not leak existence with `403`).

#### GET /api/mcqs

List MCQs for the authenticated user.

**Response (200):**
```json
{
  "mcqs": [
    {
      "id": "abc123",
      "name": "Capital cities",
      "question": "What is the capital of France?",
      "createdAt": "2026-09-04T10:00:00.000Z",
      "updatedAt": "2026-09-04T10:00:00.000Z"
    }
  ]
}
```

---

#### POST /api/mcqs

Create a new MCQ with choices.

**Request Body:**
```json
{
  "name": "Capital cities",
  "question": "What is the capital of France?",
  "choices": [
    { "choiceText": "Paris", "isCorrect": true },
    { "choiceText": "London", "isCorrect": false },
    { "choiceText": "Berlin", "isCorrect": false }
  ]
}
```

**Response (201):**
```json
{
  "id": "abc123",
  "name": "Capital cities",
  "question": "What is the capital of France?",
  "choices": [
    { "id": "c1", "choiceText": "Paris", "isCorrect": true, "sortOrder": 0 },
    { "id": "c2", "choiceText": "London", "isCorrect": false, "sortOrder": 1 },
    { "id": "c3", "choiceText": "Berlin", "isCorrect": false, "sortOrder": 2 }
  ],
  "createdAt": "2026-09-04T10:00:00.000Z",
  "updatedAt": "2026-09-04T10:00:00.000Z"
}
```

**Errors:**
- `400` — Validation failure (see Validation Rules)
- `401` — Not authenticated
- `500` — Unexpected server error

---

#### GET /api/mcqs/[id]

Get a single MCQ with choices. Caller must be the owner.

**Response (200):**
```json
{
  "id": "abc123",
  "name": "Capital cities",
  "question": "What is the capital of France?",
  "choices": [
    { "id": "c1", "choiceText": "Paris", "isCorrect": true, "sortOrder": 0 },
    { "id": "c2", "choiceText": "London", "isCorrect": false, "sortOrder": 1 }
  ],
  "createdAt": "2026-09-04T10:00:00.000Z",
  "updatedAt": "2026-09-04T10:00:00.000Z"
}
```

**Errors:**
- `401` — Not authenticated
- `404` — Not found or not owned by caller

---

#### PUT /api/mcqs/[id]

Update an MCQ and replace its choices. Caller must be the owner.

**Request Body:** Same shape as `POST /api/mcqs`.

**Response (200):** Same shape as `GET /api/mcqs/[id]`.

**Errors:**
- `400` — Validation failure
- `401` — Not authenticated
- `404` — Not found or not owned by caller
- `500` — Unexpected server error

---

#### DELETE /api/mcqs/[id]

Delete an MCQ and cascade-delete its choices and attempts. Caller must be the owner.

**Response (204):** No body.

**Errors:**
- `401` — Not authenticated
- `404` — Not found or not owned by caller
- `500` — Unexpected server error

---

#### POST /api/mcqs/[id]/attempts

Record an attempt for the authenticated user.

**Request Body:**
```json
{
  "selectedChoiceId": "c2"
}
```

**Response (201):**
```json
{
  "id": "att1",
  "mcqId": "abc123",
  "selectedChoiceId": "c2",
  "isCorrect": false,
  "createdAt": "2026-09-04T11:00:00.000Z"
}
```

**Errors:**
- `400` — Missing or invalid `selectedChoiceId`; choice does not belong to this MCQ
- `401` — Not authenticated
- `404` — MCQ not found (or not accessible)
- `500` — Unexpected server error

---

### Service Layer

Database access lives in `src/lib/db/mcq.ts` (queries) and `src/lib/services/mcq-service.ts` (business logic), following the pattern established by `src/lib/db/users.ts`.

#### Responsibilities

| Function area | Examples |
|---------------|----------|
| Queries (`src/lib/db/mcq.ts`) | `listMcqsByUserId`, `getMcqById`, `insertMcq`, `updateMcq`, `deleteMcq`, `insertChoices`, `deleteChoicesByMcqId`, `insertAttempt` |
| Service (`src/lib/services/mcq-service.ts`) | Validate ownership, orchestrate create/update transactions, enforce choice count rules, compute `is_correct` on attempts |

Route handlers call the service layer; they do not execute raw SQL directly.

---

### User Interface Requirements

Uses existing shadcn/ui components: `Table`, `Button`, `Card`, `Field`, `Input`, `Label`, `Dialog`. Add `@shadcn/dropdown-menu` for the row actions menu.

#### Dashboard (`/dashboard`)

- Keep as authenticated landing page (welcome message, user identity)
- Add navigation link to **Manage questions** → `/mcqs`
- Retain logout control (existing `LogoutButton` or equivalent nav)
- Do not embed the MCQ table on this page

#### MCQ List (`/mcqs`)

- Dedicated page for MCQ management
- Page heading: **Multiple choice questions**
- Subheading: "Create, edit, preview, and delete your questions."
- Primary button: **+ New question** → `/mcqs/new`
- Table columns:
  - **Name** — `mcq.name`
  - **Question** — `mcq.question`, truncated with ellipsis after ~80 characters on desktop
  - **Actions** — vertical-ellipsis (`MoreVertical` icon) button opening a dropdown with **Edit**, **Preview**, and **Delete** (each with a Lucide icon: pencil, eye, trash)
- Empty state when user has no questions: message + **Create question** CTA
- Delete opens a `Dialog` confirmation ("Delete this question? This cannot be undone.")
- Link or breadcrumb back to Dashboard (optional; at minimum, shared app shell with logout)

#### Create / Edit MCQ (`/mcqs/new`, `/mcqs/[id]/edit`)

Shared form component; edit mode loads data server-side from `GET` service call.

**Form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | Text | Yes | Short label; max 100 characters |
| Question | Textarea or multi-line text | Yes | Max 1000 characters |
| Choices | Dynamic list | Yes | 2–6 items; each has choice text + correct marker |

**Choice row UI:**

- Text input for choice text
- Radio button (or single-select control) to mark the one correct choice
- **Remove** button on each row (disabled when only 2 choices remain)
- **Add choice** button below the list (disabled at 6 choices)

**Actions:**

- **Save** (primary) — submit to `POST` or `PUT` API; show loading state
- **Cancel** (secondary) — navigate back to `/mcqs` without saving

**States:**

- Default (create: 2 empty choices; edit: populated)
- Validation errors (field-level via `FieldError`)
- Submitting (loading, buttons disabled)
- Not found (edit route, invalid id)

#### Preview MCQ (`/mcqs/[id]/preview`)

- Server page loads MCQ with choices via service layer (owner only)
- Page heading: **Preview question**
- Subheading: "Try answering this question. Your attempt will be recorded."
- Card displays:
  - Question name (e.g., "Q1") as a muted label
  - Full question text (bold)
  - Choices as radio buttons in bordered rows (sorted by `sort_order`)
  - **Submit answer** button (primary)
- On submit:
  - Client calls `POST /api/mcqs/[id]/attempts` with `selectedChoiceId`
  - Shows **Correct!** (green) or **Incorrect.** (destructive) feedback
  - Disables further choice changes and submit for that visit
- Validation: require a selected choice before submit ("Please select an answer.")
- **Back to questions** button (outline) → `/mcqs`
- Not found when MCQ id invalid or not owned by caller

---

### Field Validation Rules

Validation runs on the client (immediate feedback) and on the server via `validateMcqInput` in `src/lib/mcq/validation.ts` (authoritative). Same `ValidationResult` pattern as Sprint 0 auth.

#### Name

| Rule | Detail |
|------|--------|
| Required | Must not be empty or whitespace-only |
| Minimum length | 1 character (after trim) |
| Maximum length | 100 characters |

#### Question

| Rule | Detail |
|------|--------|
| Required | Must not be empty or whitespace-only |
| Maximum length | 1000 characters |

#### Choices

| Rule | Detail |
|------|--------|
| Count | Minimum 2, maximum 6 |
| Choice text | Each choice required; non-empty after trim; max 500 characters |
| Unique text | No duplicate choice text within the same question (case-insensitive trim) |
| Correct marker | Exactly one choice must have `isCorrect: true` |

---

### Error Messages

| Condition | Message |
|-----------|---------|
| Name empty | "Name is required." |
| Name too long | "Name must be 100 characters or fewer." |
| Question empty | "Question is required." |
| Question too long | "Question must be 1000 characters or fewer." |
| Too few choices | "At least 2 choices are required." |
| Too many choices | "No more than 6 choices are allowed." |
| Choice text empty | "Choice text is required." |
| Choice text too long | "Choice text must be 500 characters or fewer." |
| Duplicate choice text | "Choices must be unique." |
| No correct choice | "Select one correct answer." |
| More than one correct | "Only one choice can be marked correct." |
| MCQ not found | "Question not found." |
| Delete confirm title | "Delete question?" |
| Delete confirm body | "This will permanently delete the question and all its attempts. This cannot be undone." |
| Unexpected server failure | "Something went wrong. Please try again later." |
| Preview: no choice selected | "Please select an answer." |
| Preview: correct answer | "Correct!" |
| Preview: incorrect answer | "Incorrect." |

---

## TDD Approach

All Sprint 2 features must be built using Test-Driven Development. Tests are written before production code. Red → Green → Refactor applies to every unit of behaviour.

### Principles

1. **Red:** Write a failing test describing the desired behaviour.
2. **Green:** Write the minimum code to make the test pass.
3. **Refactor:** Improve structure without changing behaviour; tests stay green.

No feature is complete until its tests pass and acceptance criteria are satisfied.

### Test Layers

| Layer | What to test | Examples |
|-------|--------------|----------|
| Unit | Validation helpers in `src/lib/mcq/validation.ts` | Rejects 1 choice; rejects 0 correct answers; rejects 2 correct answers |
| Integration | MCQ service with mocked D1 | Create persists MCQ + choices; update replaces choices; delete cascades; ownership enforced |
| API route | Route handlers with mocked service/session | `POST /api/mcqs` returns 201; unauthenticated returns 401; wrong owner returns 404 |
| Component | Form and list interactions (Testing Library) | Add/remove choice buttons; Save disabled while submitting; delete confirmation opens |

### TDD Implementation Order

1. **Validation schemas** — unit tests for all MCQ and choice rules
2. **Database queries** — integration tests with D1 test double or in-memory SQLite
3. **MCQ service** — integration tests for create, read, update, delete, attempt recording
4. **API routes** — route handler tests for each endpoint and error path
5. **Route protection** — extend tests in `route-protection.test.ts` for `/mcqs/*`
6. **MCQ form component** — component tests for choice add/remove and validation display
7. **MCQ list page** — component or integration test for table render and empty state

### Definition of Done (TDD)

A story is done when:

- Failing tests were written first
- All tests pass
- Acceptance criteria for the story are met
- No unrelated test failures introduced
- `npm run lint` and `npm run build` succeed

---

## Implementation Phases

Phase status markers: **PLANNED** | **IN PROGRESS** | **COMPLETED**

### Phase 1: Database and Validation (TDD) — COMPLETED

**Objective:** Schema migrated locally; validation rules fully tested.

**Tasks:**
1. Create D1 migration `0002_mcq_tables.sql`
2. Apply migration locally with `npm run db:migrate:local`
3. Write failing unit tests for MCQ/choice validation rules
4. Implement validation in `src/lib/mcq/validation.ts`
5. Centralize error messages in `src/lib/mcq/messages.ts`

**Deliverables:**
- Migration file applied locally
- 100% unit test coverage for validation rules in this PRD

---

### Phase 2: Service Layer (TDD) — COMPLETED

**Objective:** MCQ service supports full CRUD and attempt recording.

**Tasks:**
1. Write failing integration tests for `mcq-service`
2. Implement `src/lib/db/mcq.ts` query functions
3. Implement `src/lib/services/mcq-service.ts`
4. Verify ownership checks and choice replacement on update
5. Refactor; keep tests green

**Deliverables:**
- Service layer with passing integration tests
- No raw SQL in route handlers

---

### Phase 3: API Routes (TDD) — COMPLETED

**Objective:** REST endpoints for MCQ CRUD and attempts.

**Tasks:**
1. Write failing route handler tests for each endpoint
2. Implement `src/app/api/mcqs/route.ts` (GET, POST)
3. Implement `src/app/api/mcqs/[id]/route.ts` (GET, PUT, DELETE)
4. Implement `src/app/api/mcqs/[id]/attempts/route.ts` (POST)
5. Wire session checks and validation on all routes (handlers in `src/lib/mcq/handlers.ts`)

**Deliverables:**
- All API endpoints functional and tested
- Consistent error responses

---

### Phase 4: MCQ List Page UI (TDD) — COMPLETED

**Objective:** `/mcqs` shows MCQ table with create button and row actions; Dashboard links to it.

**Tasks:**
1. Add shadcn-style `dropdown-menu` component (`src/components/ui/dropdown-menu.tsx`, Base UI Menu)
2. Write failing tests for list page behaviour
3. Create `/mcqs` page with MCQ table
4. Add **Manage questions** link on Dashboard → `/mcqs`
5. Implement row actions dropdown (Edit, Preview, Delete)
6. Implement delete confirmation dialog
7. Extend `PROTECTED_ROUTES` and middleware matcher for `/mcqs` and `/mcqs/*`

**Deliverables:**
- MCQ list page at `/mcqs` functional
- Dashboard navigation to MCQs in place
- Route protection extended

---

### Phase 5: Create / Edit Form UI (TDD) — COMPLETED

**Objective:** Users can create and edit MCQs through a shared form.

**Tasks:**
1. Write failing tests for MCQ form (choice add/remove, validation)
2. Build shared `McqForm` component
3. Create `/mcqs/new` page
4. Create `/mcqs/[id]/edit` page
5. Wire Save to API; Cancel navigates to `/mcqs`
6. Handle loading and error states

**Deliverables:**
- Create and edit flows working end-to-end
- Form component tests passing

---

### Phase 6: Preview Question UI (TDD) — COMPLETED

**Objective:** Users can preview and try answering their own questions; attempts are recorded.

**Tasks:**
1. Write failing tests for preview component (choice selection, submit, result feedback)
2. Build `McqPreview` client component
3. Create `/mcqs/[id]/preview` page
4. Add **Preview** row action with eye icon in `McqTable`
5. Update list page copy to mention preview

**Deliverables:**
- Preview flow working end-to-end
- Preview component tests passing

---

### Phase 7: Hardening and Acceptance — COMPLETED

**Objective:** Meet acceptance criteria; lint, build, and preview pass.

**Tasks:**
1. Accessibility check (labels, focus, keyboard access to dropdown)
2. Responsive layout on mobile (table scroll, form single-column)
3. Security review (ownership, input sanitization, no SQL injection)
4. Run `npm run lint`, `npm run build`, `npm run test`
5. Verify with `npm run preview` for Workers-runtime behaviour
6. Mark acceptance criteria complete

**Deliverables:**
- All acceptance criteria checked
- All tests green

---

## Technical Implementation Details

### Key Files (implemented)

| File | Purpose |
|------|---------|
| `d1/migrations/0002_mcq_tables.sql` | MCQ schema migration |
| `src/lib/mcq/validation.ts` | MCQ/choice validation rules |
| `src/lib/mcq/validation.test.ts` | Validation unit tests |
| `src/lib/mcq/messages.ts` | Canonical error message strings |
| `src/lib/mcq/types.ts` | Shared MCQ TypeScript types |
| `src/lib/mcq/deps.ts` | Cloudflare D1 dependency helper |
| `src/lib/mcq/api.ts` | API session and response helpers |
| `src/lib/mcq/handlers.ts` | Route handler logic (testable) |
| `src/lib/mcq/handlers.test.ts` | API handler integration tests |
| `src/lib/mcq/format.ts` | Question text truncation for list view |
| `src/lib/mcq/test-utils.ts` | In-memory repository for tests |
| `src/lib/db/mcq.ts` | D1 prepared-statement queries |
| `src/lib/services/mcq-service.ts` | Business logic and ownership |
| `src/lib/services/mcq-service.test.ts` | Service integration tests |
| `src/app/api/mcqs/route.ts` | List and create endpoints |
| `src/app/api/mcqs/[id]/route.ts` | Get, update, delete endpoints |
| `src/app/api/mcqs/[id]/attempts/route.ts` | Record attempt endpoint |
| `src/app/dashboard/page.tsx` | Landing page with link to `/mcqs` |
| `src/app/mcqs/page.tsx` | MCQ list page with table |
| `src/app/mcqs/new/page.tsx` | Create MCQ page |
| `src/app/mcqs/[id]/edit/page.tsx` | Edit MCQ page |
| `src/app/mcqs/[id]/preview/page.tsx` | Preview MCQ page |
| `src/components/mcq/mcq-form.tsx` | Shared create/edit form |
| `src/components/mcq/mcq-form.test.tsx` | Form component tests |
| `src/components/mcq/mcq-preview.tsx` | Preview question UI with attempt submit |
| `src/components/mcq/mcq-preview.test.tsx` | Preview component tests |
| `src/components/mcq/mcq-table.tsx` | MCQ list table with actions |
| `src/components/app-page-shell.tsx` | Shared layout for MCQ pages |
| `src/components/ui/dropdown-menu.tsx` | Row actions menu (Base UI Menu) |
| `src/components/ui/textarea.tsx` | Multi-line question input |
| `src/lib/auth/route-protection.ts` | Extended protected routes (`/mcqs`) |
| `src/middleware.ts` | Matcher extended for `/mcqs/*` |

### Implementation Patterns

```typescript
// Route handler pattern: session → validate → service → response
export async function POST(request: Request) {
  const context = await getMcqApiContext();
  if (!context) return unauthorizedResponse();
  const input = await parseMcqInput(request);
  const result = await createMcq(context.session.userId, input, context.dependencies);
  return mapServiceResult(result, { created: true });
}
```

```typescript
// D1 query pattern (from project conventions)
const result = await db
  .prepare("SELECT id, name, question FROM mcq WHERE created_by_user_id = ?1")
  .bind(userId)
  .all<{ id: string; name: string; question: string }>();
return result.results;
```

### Important Notes

- Use numbered placeholders (`?1`, `?2`) in all D1 queries.
- Prefer `.all()` over `.first()` for consistency across local and remote D1.
- MCQ pages are server components where possible; client components only for interactive form and dropdown.
- On update, replace all choices in a transaction: delete existing choices for the MCQ, insert new set.
- `created_by_user_id` is set on create only; never updatable.
- Validation uses `validateMcqInput` (not Zod); shared between client form, service layer, and API.
- **88 tests** pass as of implementation complete (`npm run test`).

---

## Acceptance Criteria

### MCQ List

- [x] Authenticated user sees a table of their MCQs on `/mcqs`
- [x] Dashboard includes a link to `/mcqs`
- [x] Table columns include Name, Question, and Actions
- [x] **Create question** button navigates to `/mcqs/new`
- [x] Empty state shown when user has no questions
- [x] Row ⋮ menu offers **Edit**, **Preview**, and **Delete**
- [x] Delete requires confirmation before removing the MCQ

### MCQ Create

- [x] User can create an MCQ with name, question, and 2–6 choices
- [x] Form starts with 2 choice rows on create
- [x] User can add choices up to 6 and remove down to 2
- [x] Exactly one choice must be marked correct
- [x] Validation errors display for invalid input
- [x] Successful save redirects to `/mcqs` with the new question visible

### MCQ Edit

- [x] User can edit an existing MCQ from the row actions menu
- [x] Form is pre-populated with current name, question, and choices
- [x] Successful save updates the MCQ and redirects to `/mcqs`
- [x] **Cancel** returns to `/mcqs` without saving
- [x] Editing another user's MCQ returns not-found behaviour

### MCQ Delete

- [x] Delete removes the MCQ, its choices, and its attempts
- [x] Deleted MCQ no longer appears in the list

### MCQ Preview

- [x] User can open preview from the row actions menu
- [x] Preview page shows question name, text, and choices as radio buttons
- [x] User must select a choice before submitting
- [x] Submit records an attempt via `POST /api/mcqs/[id]/attempts`
- [x] UI shows correct/incorrect feedback after submit
- [x] **Back to questions** returns to `/mcqs`
- [x] Previewing another user's MCQ returns not-found behaviour

### Attempts API

- [x] `POST /api/mcqs/[id]/attempts` records selected choice and correctness
- [x] Attempt rejected if choice does not belong to the MCQ
- [x] Unauthenticated attempt returns 401

### Access Control

- [x] Unauthenticated access to `/dashboard` and `/mcqs/*` redirects to `/sign-in`
- [x] Users only see and modify their own MCQs

### Non-Functional

- [x] All automated tests for MCQ behaviour pass
- [x] `npm run lint` and `npm run build` succeed
- [x] Form fields have visible labels
- [x] Pages usable at 320px viewport width (responsive Tailwind layout; formal WCAG audit deferred)

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| MCQ CRUD test coverage | All acceptance criteria have automated tests | Test suite review |
| Create flow completion | Valid MCQ saved on first attempt in manual QA | Staging walkthrough |
| API correctness | All endpoints return documented status codes | Route handler tests |
| Ownership isolation | 100% of cross-user access attempts return 404 | Integration tests |
| Build health | Lint and build pass with MCQ changes | CI / local `npm run lint` && `npm run build` |

---

## Dependencies

### External Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| Cloudflare D1 | Persist MCQs, choices, attempts | Configured (`DB` binding) |
| Better Auth / session | Authenticate API and page requests | Available (Sprint 0) |
| Vitest | TDD test runner | Available (Sprint 0) |
| Zod | Request and form validation | **Not used** — hand-written validation in `src/lib/mcq/validation.ts` |

### Internal Dependencies

| Dependency | Purpose |
|------------|---------|
| Sprint 0 authentication | Session, protected routes, user identity |
| `src/lib/db/users.ts` pattern | Query module conventions |
| shadcn/ui `table`, `button`, `dialog`, `field`, `input` | List and form UI |
| shadcn/ui `dropdown-menu` | Row actions menu | **Added** — `src/components/ui/dropdown-menu.tsx` (Base UI Menu) |
| shadcn/ui `textarea` | Question field | **Added** — `src/components/ui/textarea.tsx` |

### shadcn Components Added

`dropdown-menu` and `textarea` were added manually (Base UI primitives) when the shadcn CLI install stalled. Equivalent to:

```bash
npx shadcn@latest add @shadcn/dropdown-menu @shadcn/textarea
```

---

## Risks and Mitigation

### Technical Risks

- **Risk:** Choice update logic leaves orphaned rows or duplicate `sort_order` values.
  **Mitigation:** Replace-all strategy in a single transaction; test update paths thoroughly.

- **Risk:** API routes bypass ownership checks.
  **Mitigation:** Centralize ownership in service layer; test cross-user access in every endpoint.

- **Risk:** D1 local vs. remote behaviour differs for transactions.
  **Mitigation:** Verify create/update/delete with `npm run preview`; use batch statements where needed.

### User Experience Risks

- **Risk:** Truncated question text in the table hides important context.
  **Mitigation:** Show full question on edit; consider tooltip on hover as a minor enhancement.

- **Risk:** Accidental delete without confirmation.
  **Mitigation:** Require explicit confirmation dialog before delete.

---

## Troubleshooting Guide

### MCQ pages fail on `npm run dev`

**Problem:** Create/list/edit pages error when accessing D1.
**Cause:** `npm run dev` runs on Node; `getCloudflareContext()` and D1 bindings require the Workers runtime.
**Solution:** Use `npm run preview` for local testing with D1. Apply migrations first: `npm run db:migrate:local`.

### shadcn CLI stalls on Windows

**Problem:** `npx shadcn@latest add` hangs or fails.
**Cause:** CLI install/network issues on Windows.
**Solution:** Components were added manually under `src/components/ui/` using Base UI primitives, matching the `base-nova` style.

### Template Entry Format

**Problem:** [What goes wrong]
**Cause:** [Why it happens]
**Solution:** [How to fix it]

---

## Notes for AI Agents

When working with this PRD:

1. Read **Scope (In/Out/Cut)** before writing code — do not build quiz assembly or full quiz-taking UI (timer, scoring dashboard).
2. Follow **TDD** — write failing tests before implementation for every behaviour.
3. Use the **service layer** — route handlers must not contain raw SQL.
4. Enforce **ownership** via `created_by_user_id` on every read, update, and delete.
5. Use **canonical error messages** from this document.
6. Extend **route protection** for `/mcqs/*` in `route-protection.ts` and `middleware.ts`.
7. Validation uses **`validateMcqInput`** in `src/lib/mcq/validation.ts` (not Zod).
8. Apply migrations **locally only** — never `--remote`.
9. Update **phase status markers** as work progresses.
10. Mark **acceptance criteria** when verified.
11. Verify with `npm run lint`, `npm run build`, and `npm run test` before claiming completion.
12. Use `npm run preview` for Workers-runtime-sensitive behaviour.
13. Update **AGENTS.md** Project section when Sprint 2 ships.

---

## Current Status

**Last Updated:** September 4, 2026
**Current Phase:** Sprint 2 MCQ CRUD — COMPLETED (including preview)
**Status:** COMPLETED
**Verification:** All tests passing; `npm run lint` and `npm run build` succeed; local D1 migration `0002_mcq_tables.sql` applied
**Next Steps:** Manual QA via `npm run preview`; future sprint for quiz assembly
