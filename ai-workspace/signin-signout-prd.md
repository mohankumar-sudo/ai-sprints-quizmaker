Date created: August 31, 2026
Date last modified: August 31, 2026

# Quiz Maker - Technical PRD

## Document Purpose

This document is the source of truth for the Quiz Maker project. It defines what will be built, how it should behave, and how success is measured. Developers and AI agents must read this document before starting any sprint work.

**Current focus:** Sprint 0 — Authentication module design and implementation planning.

**Explicit exclusions from this document:** database schemas, API specifications, UI component implementations, folder structures, and code samples. Those will be defined in later sprints or implementation documents after this PRD is approved.

---

## Project Overview

Quiz Maker is a web application that will eventually allow users to create quizzes, manage quizzes, attempt quizzes, and view their results. The long-term product serves educators, trainers, and learners who need a simple way to build and take assessments online.

At this stage, no application features have been built. The project uses a Next.js 16 starter hosted on Cloudflare Workers. This PRD covers only the authentication foundation that all future quiz features will depend on.

Without authentication, users cannot be identified, sessions cannot be maintained, and protected pages (such as a future dashboard and quiz management screens) cannot be secured. Sprint 0 establishes that foundation.

---

## Business Goal

Enable secure user identity and session management so that:

1. Only registered users can access protected areas of the application.
2. Users can create an account, sign in, and sign out with a clear and trustworthy experience.
3. Future quiz-related features can rely on a stable, well-tested authentication layer without rework.

The business value of Sprint 0 is risk reduction: authentication is cross-cutting infrastructure. Getting it right early prevents security gaps and inconsistent user experiences across later features.

---

## Sprint Goal

**Sprint 0 Goal:** Design and implement the authentication feature before any quiz-related development begins.

### In Scope for Sprint 0

- User Sign Up
- User Sign In
- Logout
- User Session Management
- Protected Routes
- Basic authentication flow (register → sign in → access protected content → logout)

### Out of Scope for Sprint 0

- Quiz creation
- Quiz management
- Quiz attempts
- Reports and analytics
- Password reset / forgot password
- Email verification
- Social login (Google, GitHub, etc.)
- Multi-factor authentication
- User profile editing
- Role-based access control (admin vs. user)
- Any AI or quiz-generation features

---

## Overview / Problem

Today, the Quiz Maker application has no way to identify users or restrict access to pages. Anyone who knows a URL could reach any route once pages exist. There is no registration flow, no login flow, and no session persistence.

Users who will eventually create and take quizzes need a standard, secure way to register with an email and password, sign in, remain signed in across page visits, and sign out when done. Protected routes must automatically redirect unauthenticated visitors to the Sign In page.

This sprint solves the identity and access problem only. It does not solve content creation or quiz delivery.

---

## Hypothesis

We believe that delivering a complete email-and-password authentication module with session management and route protection will give Quiz Maker a secure, extensible foundation so that all future quiz features can be built for authenticated users only.

---

## Scope

### In Scope

- Sign Up page with Full Name, Email, Password, and Confirm Password
- Sign In page with Email and Password
- Logout action that clears the session
- Session persistence until explicit logout or session expiry (behaviour to be defined during implementation)
- Protected route mechanism: unauthenticated users redirected to Sign In
- Post-registration redirect to Sign In
- Post-login redirect to Dashboard (placeholder protected page for Sprint 0)
- Client-side and server-side validation rules as specified in this document
- Meaningful error and success messages
- Responsive, accessible Sign Up and Sign In pages
- Test-driven development for all authentication behaviour

### Out of Scope

See Sprint Goal section above. Additionally:

- Database schema design (deferred to implementation sprint)
- API contract design (deferred to implementation sprint)
- Production deployment configuration beyond what the starter already provides
- Internationalization (i18n)
- Remember-me / extended session checkbox (may be considered in a future enhancement)

### Cut

| Item | Reason for cutting |
|------|-------------------|
| Social / OAuth login | Adds provider complexity; email/password is sufficient for MVP auth |
| Email verification | Not required for Sprint 0; can be added before production launch |
| Password reset flow | Separate feature; not needed to prove core auth works |
| Role-based permissions | No admin vs. user distinction needed until quiz management exists |
| CAPTCHA / bot protection | Can be added if abuse becomes a problem |

---

## User Flow

### New User Registration Flow

1. User navigates to the Sign Up page.
2. User enters Full Name, Email, Password, and Confirm Password.
3. User submits the form.
4. System validates all fields (client-side first, then server-side).
5. If validation fails, inline and/or form-level errors are displayed; user remains on Sign Up.
6. If email is already registered, an error is shown; user remains on Sign Up.
7. If registration succeeds, user sees a success indication and is redirected to the Sign In page.
8. User signs in with the credentials just created.

### Returning User Sign In Flow

1. User navigates to the Sign In page (directly or via redirect from a protected route).
2. User enters Email and Password.
3. User submits the form.
4. System validates input format and credentials.
5. If credentials are invalid, a meaningful error is displayed; user remains on Sign In.
6. If sign in succeeds, a session is created and user is redirected to the Dashboard.
7. Session persists across page navigation and browser refresh until logout or expiry.

### Logout Flow

1. Authenticated user triggers Logout (e.g., from Dashboard or a navigation element).
2. System clears the session.
3. User is redirected to the Sign In page.
4. Previously protected routes are no longer accessible without signing in again.

### Protected Route Access Flow

1. Unauthenticated user attempts to visit a protected route (e.g., Dashboard).
2. System detects no valid session.
3. User is redirected to Sign In page.
4. Optionally, the original destination may be preserved for redirect after successful login (recommended enhancement; see Open Questions).

### Navigation Flow Summary

```
Sign Up  ──(success)──►  Sign In  ──(success)──►  Dashboard (protected)
                              ▲                        │
                              │                        │
                              └──────(logout)──────────┘

Unauthenticated user ──► Protected route ──► Redirect to Sign In
```

---

## User Stories

### Sign Up

| ID | Story | Priority |
|----|-------|----------|
| US-01 | As a new user, I want to register with my full name, email, and password so that I can create a Quiz Maker account. | Must Have |
| US-02 | As a new user, I want to see clear validation errors when I enter invalid or incomplete information so that I can fix my input easily. | Must Have |
| US-03 | As a new user, I want to be told if my email is already registered so that I know to sign in instead. | Must Have |
| US-04 | As a new user, I want to be redirected to the Sign In page after successful registration so that I can log in with my new account. | Must Have |

### Sign In

| ID | Story | Priority |
|----|-------|----------|
| US-05 | As a registered user, I want to sign in with my email and password so that I can access my account. | Must Have |
| US-06 | As a registered user, I want to see a clear error when my credentials are wrong so that I know sign in failed without exposing sensitive details. | Must Have |
| US-07 | As a registered user, I want to be redirected to the Dashboard after successful sign in so that I can use the application. | Must Have |
| US-08 | As a signed-in user, I want my session to persist across page refreshes so that I do not have to sign in repeatedly. | Must Have |

### Logout

| ID | Story | Priority |
|----|-------|----------|
| US-09 | As a signed-in user, I want to log out so that my session is ended on shared or personal devices. | Must Have |
| US-10 | As a user who logged out, I want to be redirected to the Sign In page so that I know I am signed out. | Must Have |

### Protected Routes

| ID | Story | Priority |
|----|-------|----------|
| US-11 | As an unauthenticated visitor, I should be redirected to Sign In when I try to access protected pages so that only signed-in users see private content. | Must Have |
| US-12 | As a signed-in user, I should be able to access protected pages without being redirected to Sign In. | Must Have |

---

## Functional Requirements

### FR-01: Sign Up

| Req ID | Requirement |
|--------|-------------|
| FR-01.1 | The system shall provide a Sign Up page accessible to unauthenticated users. |
| FR-01.2 | The Sign Up form shall collect: Full Name, Email Address, Password, Confirm Password. |
| FR-01.3 | All Sign Up fields are required. Empty submission shall produce validation errors. |
| FR-01.4 | Email shall be validated for correct format before submission. |
| FR-01.5 | Email shall be unique across all registered users. Duplicate email shall reject registration. |
| FR-01.6 | Password shall meet complexity rules (see Validation Rules). |
| FR-01.7 | Confirm Password shall exactly match Password. |
| FR-01.8 | On successful registration, the user shall be redirected to the Sign In page. |
| FR-01.9 | Passwords shall never be stored in plain text. |
| FR-01.10 | Full Name shall be stored and associated with the user account for future display purposes. |

### FR-02: Sign In

| Req ID | Requirement |
|--------|-------------|
| FR-02.1 | The system shall provide a Sign In page accessible to unauthenticated users. |
| FR-02.2 | The Sign In form shall collect: Email, Password. |
| FR-02.3 | Both fields are required. |
| FR-02.4 | The system shall validate credentials against stored user records. |
| FR-02.5 | Invalid credentials shall result in an error message without revealing whether the email exists (see Security Requirements). |
| FR-02.6 | On successful sign in, the system shall create a user session. |
| FR-02.7 | On successful sign in, the user shall be redirected to the Dashboard. |
| FR-02.8 | The session shall remain active until the user logs out or the session expires. |

### FR-03: Logout

| Req ID | Requirement |
|--------|-------------|
| FR-03.1 | Authenticated users shall have a visible way to log out. |
| FR-03.2 | Logout shall invalidate/clear the current session. |
| FR-03.3 | After logout, the user shall be redirected to the Sign In page. |
| FR-03.4 | After logout, protected routes shall no longer be accessible without signing in again. |

### FR-04: Session Management

| Req ID | Requirement |
|--------|-------------|
| FR-04.1 | The system shall maintain session state server-side or via secure, HTTP-only cookies (implementation decision deferred). |
| FR-04.2 | Session shall survive full page reloads within the same browser. |
| FR-04.3 | Session shall include sufficient identity information to recognize the authenticated user (at minimum: user identifier and email). |
| FR-04.4 | Expired or invalid sessions shall be treated as unauthenticated. |

### FR-05: Protected Routes

| Req ID | Requirement |
|--------|-------------|
| FR-05.1 | The Dashboard shall be a protected route available only to authenticated users. |
| FR-05.2 | Unauthenticated access to any protected route shall redirect to Sign In. |
| FR-05.3 | Authenticated users accessing Sign Up or Sign In may optionally be redirected to Dashboard (recommended; see Open Questions). |
| FR-05.4 | Protection shall be enforced on the server, not by client-side checks alone. |

---

## Non-Functional Requirements

### Security

| Req ID | Requirement |
|--------|-------------|
| NFR-S01 | Passwords must be hashed using a modern, adaptive algorithm (e.g., bcrypt, Argon2). |
| NFR-S02 | Authentication tokens or session cookies must use HTTP-only and Secure flags in production. |
| NFR-S03 | Sign In errors must not disclose whether an email is registered (use generic "Invalid email or password"). |
| NFR-S04 | All authentication endpoints and pages must be served over HTTPS in production. |
| NFR-S05 | Rate limiting or brute-force mitigation should be considered for Sign In (implementation detail). |
| NFR-S06 | Input must be sanitized to prevent injection attacks. |
| NFR-S07 | CSRF protection must be applied to state-changing authentication actions where applicable. |

### Performance

| Req ID | Requirement |
|--------|-------------|
| NFR-P01 | Sign In and Sign Up form submission should complete within 2 seconds under normal network conditions. |
| NFR-P02 | Protected route checks should not add perceptible delay to page loads (< 200 ms server-side overhead target). |
| NFR-P03 | Client-side validation should provide immediate feedback without waiting for server response. |

### Scalability

| Req ID | Requirement |
|--------|-------------|
| NFR-SC01 | Authentication design must work on Cloudflare Workers without relying on in-memory-only session stores for production. |
| NFR-SC02 | Session and user storage must support horizontal scaling (shared persistence layer). |
| NFR-SC03 | Auth module should be isolated so it can be extended (e.g., OAuth) without rewriting core flows. |

### Accessibility

| Req ID | Requirement |
|--------|-------------|
| NFR-A01 | Sign Up and Sign In pages must meet WCAG 2.1 Level AA where practical. |
| NFR-A02 | All form fields must have associated visible labels. |
| NFR-A03 | Validation errors must be announced to screen readers (aria-live or equivalent). |
| NFR-A04 | Focus order must be logical; keyboard-only users must complete all flows. |
| NFR-A05 | Colour must not be the only indicator of errors or success. |
| NFR-A06 | Touch targets must be at least 44×44 CSS pixels on mobile. |

### Responsive Design

| Req ID | Requirement |
|--------|-------------|
| NFR-R01 | Sign Up and Sign In pages must be usable on mobile (320px width), tablet, and desktop. |
| NFR-R02 | Forms must remain readable and submittable without horizontal scrolling on mobile. |
| NFR-R03 | Layout must adapt gracefully; single-column on small screens is acceptable. |

### Maintainability

| Req ID | Requirement |
|--------|-------------|
| NFR-M01 | Authentication logic must be separated from page presentation. |
| NFR-M02 | Validation rules must be defined in one place and reused across client and server where possible. |
| NFR-M03 | Error message strings must be centralized for easy updates. |
| NFR-M04 | All authentication behaviour must be covered by automated tests (see TDD Approach). |

### Clean Architecture

| Req ID | Requirement |
|--------|-------------|
| NFR-CA01 | Domain rules (validation, session rules) must not depend on UI framework details. |
| NFR-CA02 | Data access (user lookup, persistence) must be abstracted behind interfaces or service boundaries. |
| NFR-CA03 | Route protection must be implemented as reusable middleware or equivalent, not duplicated per page. |
| NFR-CA04 | Dependencies should point inward: UI → application services → domain, not the reverse. |

---

## UI Requirements

These requirements describe pages and behaviour only. They do not prescribe component libraries, markup, or file organization.

### Sign Up Page

**Route:** `/sign-up` (exact path may be finalized during implementation)

**Purpose:** Allow new users to create an account.

**Layout elements:**

- Page title (e.g., "Create your account" or "Sign Up")
- Brief subtitle or helper text explaining the purpose
- Sign Up form
- Link to Sign In page for users who already have an account (e.g., "Already have an account? Sign in")

**Form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full Name | Text | Yes | Display name; trim leading/trailing whitespace |
| Email Address | Email | Yes | Must be unique and valid format |
| Password | Password | Yes | Masked input; may include show/hide toggle |
| Confirm Password | Password | Yes | Masked input; must match Password |

**Actions:**

- Primary button: "Sign Up" (or "Create Account")
- Submit disabled or loading state while request is in progress

**States:**

- Default (empty form)
- Validation error (field-level and/or form-level)
- Submitting (loading)
- Success (brief confirmation before redirect, or immediate redirect)

### Sign In Page

**Route:** `/sign-in` (exact path may be finalized during implementation)

**Purpose:** Allow registered users to authenticate.

**Layout elements:**

- Page title (e.g., "Sign in to Quiz Maker" or "Sign In")
- Sign In form
- Link to Sign Up page for new users (e.g., "Don't have an account? Sign up")

**Form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Email | Email | Yes | |
| Password | Password | Yes | Masked input; may include show/hide toggle |

**Actions:**

- Primary button: "Sign In"
- Logout is not on this page; it appears on authenticated pages (e.g., Dashboard)

**States:**

- Default
- Validation error
- Authentication error (invalid credentials)
- Submitting (loading)
- Success (redirect to Dashboard)

### Dashboard (Protected Placeholder)

**Route:** `/dashboard` (exact path may be finalized during implementation)

**Purpose:** Minimal authenticated landing page for Sprint 0 to prove protected route and session work.

**Content (Sprint 0 minimum):**

- Confirmation that the user is signed in (e.g., welcome message using Full Name or email)
- Logout control
- No quiz features

### Input Fields — Summary

All authentication forms use standard HTML semantic input types. Autocomplete attributes should be set appropriately (`name`, `email`, `new-password`, `current-password`) for browser password managers.

---

## Field Validation Rules

Validation must run on the client (immediate feedback) and on the server (authoritative). Server validation is the source of truth.

### Full Name

| Rule | Detail |
|------|--------|
| Required | Must not be empty or whitespace-only |
| Minimum length | 2 characters (after trim) |
| Maximum length | 100 characters |
| Allowed characters | Letters, spaces, hyphens, apostrophes (reject obviously invalid input) |

### Email Address

| Rule | Detail |
|------|--------|
| Required | Must not be empty |
| Format | Valid email format (contains `@`, valid domain structure) |
| Uniqueness | Must not match an existing registered email (checked server-side on Sign Up) |
| Maximum length | 254 characters |
| Normalization | Trim whitespace; store/compare in consistent case (lowercase recommended) |

### Password

| Rule | Detail |
|------|--------|
| Required | Must not be empty |
| Minimum length | 8 characters |
| Uppercase | At least one uppercase letter (A–Z) |
| Lowercase | At least one lowercase letter (a–z) |
| Number | At least one digit (0–9) |
| Special character | At least one special character from: `! @ # $ % ^ & * ( ) _ + - = [ ] { } ; ' : " \ | , . < > / ?` |
| Maximum length | 128 characters (reasonable upper bound) |

### Confirm Password

| Rule | Detail |
|------|--------|
| Required | Must not be empty |
| Match | Must exactly match Password field |

### Sign In — Email and Password

| Field | Rules |
|-------|-------|
| Email | Required; valid email format |
| Password | Required; no complexity check on sign in (complexity enforced at registration only) |

---

## Error Messages

Messages must be clear, actionable, and user-friendly. Wording below is canonical; minor grammatical adjustments are acceptable if consistency is maintained.

### Sign Up — Field Validation Errors

| Condition | Message |
|-----------|---------|
| Full Name empty | "Full name is required." |
| Full Name too short | "Full name must be at least 2 characters." |
| Full Name too long | "Full name must be 100 characters or fewer." |
| Email empty | "Email is required." |
| Email invalid format | "Please enter a valid email address." |
| Email already registered | "An account with this email already exists. Please sign in." |
| Password empty | "Password is required." |
| Password too short | "Password must be at least 8 characters." |
| Password missing uppercase | "Password must contain at least one uppercase letter." |
| Password missing lowercase | "Password must contain at least one lowercase letter." |
| Password missing number | "Password must contain at least one number." |
| Password missing special character | "Password must contain at least one special character." |
| Confirm Password empty | "Please confirm your password." |
| Confirm Password mismatch | "Passwords do not match." |

### Sign Up — Server Errors

| Condition | Message |
|-----------|---------|
| Unexpected server failure | "Something went wrong. Please try again later." |

### Sign In — Field Validation Errors

| Condition | Message |
|-----------|---------|
| Email empty | "Email is required." |
| Email invalid format | "Please enter a valid email address." |
| Password empty | "Password is required." |

### Sign In — Authentication Errors

| Condition | Message |
|-----------|---------|
| Invalid credentials | "Invalid email or password." |
| Unexpected server failure | "Something went wrong. Please try again later." |

### Session / Protected Route

| Condition | Behaviour |
|-----------|-----------|
| Unauthenticated access to protected route | Silent redirect to Sign In (optional flash: "Please sign in to continue.") |

---

## Success Messages

| Event | Message / Behaviour |
|-------|---------------------|
| Registration successful | Redirect to Sign In; optional toast/banner: "Account created successfully. Please sign in." |
| Sign in successful | Redirect to Dashboard; optional toast: "Welcome back!" |
| Logout successful | Redirect to Sign In; optional toast: "You have been signed out." |

Success messages may be omitted if redirect alone provides sufficient feedback, but registration success should communicate that the account was created before asking the user to sign in.

---

## Navigation Flow

| From | Action | To |
|------|--------|-----|
| Sign Up | Successful registration | Sign In |
| Sign Up | "Already have an account?" link | Sign In |
| Sign In | Successful authentication | Dashboard |
| Sign In | "Don't have an account?" link | Sign Up |
| Dashboard | Logout | Sign In |
| Protected route (unauthenticated) | Automatic redirect | Sign In |
| Any public page | User navigates manually | Sign Up or Sign In |

Authenticated users visiting Sign In or Sign Up should be redirected to Dashboard (recommended default; confirm in Open Questions).

---

## Authentication Flow

### Registration (Sign Up)

```
User fills Sign Up form
        │
        ▼
Client-side validation
        │
   ┌────┴────┐
   │ Fail    │ Pass
   ▼         ▼
Show errors  Submit to server
             │
        ┌────┴────┐
        │ Fail    │ Pass
        ▼         ▼
   Show errors   Create user record (hashed password)
                 Redirect to Sign In
```

### Sign In

```
User fills Sign In form
        │
        ▼
Client-side validation
        │
   ┌────┴────┐
   │ Fail    │ Pass
   ▼         ▼
Show errors  Submit credentials to server
             │
        ┌────┴────┐
        │ Fail    │ Pass
        ▼         ▼
   "Invalid      Create session
    email or     Redirect to Dashboard
    password"
```

### Session Lifecycle

```
Sign In success ──► Session created ──► User accesses protected routes
                          │
              ┌───────────┼───────────┐
              │           │           │
         Page refresh   Navigation   Logout / expiry
              │           │           │
              ▼           ▼           ▼
         Session valid  Session valid  Session cleared
         (still auth)   (still auth)   Redirect to Sign In
```

### Route Protection

```
Request to protected route
        │
        ▼
Session valid?
        │
   ┌────┴────┐
   │ No      │ Yes
   ▼         ▼
Redirect    Allow access
to Sign In
```

---

## Security Requirements

| ID | Requirement |
|----|-------------|
| SEC-01 | Store only hashed passwords; never log or expose plain-text passwords. |
| SEC-02 | Use generic error message for failed Sign In (do not say "email not found" vs. "wrong password"). |
| SEC-03 | Session identifiers must be unpredictable (cryptographically random). |
| SEC-04 | Session cookies must be HTTP-only to reduce XSS token theft risk. |
| SEC-05 | Session cookies must use Secure flag in production. |
| SEC-06 | SameSite cookie attribute should be set (Lax or Strict; implementation decision). |
| SEC-07 | Validate and sanitize all user input on the server. |
| SEC-08 | Enforce HTTPS in production for all auth-related traffic. |
| SEC-09 | Do not expose internal error details (stack traces, database errors) to the user. |
| SEC-10 | Consider rate limiting on Sign In and Sign Up to mitigate brute force and enumeration. |
| SEC-11 | Full Name and Email are personal data; handle according to applicable privacy expectations. |

---

## TDD Approach

All authentication features in Sprint 0 must be built using Test-Driven Development. Tests are written before production code. The Red → Green → Refactor cycle applies to every unit of behaviour.

### Principles

1. **Red:** Write a failing test that describes the desired behaviour.
2. **Green:** Write the minimum code to make the test pass.
3. **Refactor:** Improve structure without changing behaviour; tests must stay green.

No authentication feature is considered complete until its tests pass and acceptance criteria are satisfied.

### Test Layers

| Layer | What to test | Examples (behaviour descriptions, not code) |
|-------|--------------|-----------------------------------------------|
| Unit | Pure validation logic, password rules, email format checks | Password missing uppercase returns correct error; confirm password mismatch detected |
| Integration | Auth service with persistence layer (or test doubles) | Registering a new user persists record; duplicate email rejected; valid credentials create session; invalid credentials rejected |
| End-to-end (E2E) | Full user journeys in a browser or browser-like environment | User completes Sign Up → Sign In → sees Dashboard → Logout → cannot access Dashboard |

### Test Categories by Feature

#### Sign Up Tests (write first)

- Rejects empty Full Name, Email, Password, Confirm Password
- Rejects invalid email format
- Rejects password that fails each complexity rule individually
- Rejects Confirm Password that does not match Password
- Rejects duplicate email
- Accepts valid input and completes registration
- Redirects to Sign In after success

#### Sign In Tests (write first)

- Rejects empty email or password
- Rejects invalid email format
- Rejects wrong password for existing user
- Rejects non-existent email (same error message as wrong password)
- Accepts valid credentials and establishes session
- Redirects to Dashboard after success

#### Session Tests (write first)

- Session persists after simulated page reload
- Invalid or expired session treated as logged out
- Session contains expected user identity

#### Logout Tests (write first)

- Logout clears session
- After logout, protected routes redirect to Sign In

#### Protected Route Tests (write first)

- Unauthenticated request to Dashboard redirects to Sign In
- Authenticated request to Dashboard succeeds

### TDD Implementation Order

Tests and implementation should proceed in this order to manage dependencies:

1. **Validation rules** — unit tests for all field rules
2. **Registration service** — integration tests for Sign Up behaviour
3. **Authentication service** — integration tests for Sign In and session creation
4. **Session management** — integration tests for persistence and invalidation
5. **Route protection** — integration/E2E tests for redirect behaviour
6. **Sign Up page behaviour** — E2E or component-level tests for form interaction
7. **Sign In page behaviour** — E2E or component-level tests for form interaction
8. **Logout and Dashboard** — E2E tests for complete flows

### Testing Framework

A testing framework is not yet installed in the project. Before implementation begins, the team must add and configure:

- A unit/integration test runner (e.g., Vitest or Jest)
- An E2E test tool if browser flows will be automated (e.g., Playwright)

The choice of framework must be documented when added. Tests must run in CI via `npm run test` (or equivalent script to be added).

### Definition of Done (TDD)

A story is done when:

- Failing tests were written first
- All tests pass
- Acceptance criteria for the story are met
- No unrelated test failures introduced
- Lint and build succeed

---

## Implementation Phases

Phase status markers: **PLANNED** | **IN PROGRESS** | **COMPLETED**

### Phase 0: Foundation and Test Setup — COMPLETED

**Objective:** Prepare dependencies, testing infrastructure, and auth technology choices.

**Tasks:**

1. Select and add authentication library or approach suitable for Next.js on Cloudflare Workers
2. Select and add testing framework; configure test scripts
3. Document technology choices in a brief implementation note (separate from this PRD)
4. Define session storage approach compatible with Cloudflare Workers

**Deliverables:**

- Testing framework installed and runnable
- Auth approach documented and approved
- Empty test suites scaffolded for validation, registration, sign in, session, and route protection

---

### Phase 1: Validation Layer (TDD) — COMPLETED

**Objective:** Implement all field validation rules with full unit test coverage.

**Tasks:**

1. Write failing unit tests for Full Name, Email, Password, Confirm Password rules
2. Implement validation logic until tests pass
3. Write failing unit tests for Sign In field validation
4. Implement Sign In validation until tests pass
5. Refactor; centralize error message constants

**Deliverables:**

- 100% unit test coverage for validation rules defined in this PRD
- Shared validation usable by client and server

---

### Phase 2: Registration (TDD) — COMPLETED

**Objective:** Users can register with valid credentials; invalid input is rejected.

**Tasks:**

1. Write failing integration tests for Sign Up (success, duplicate email, validation failures)
2. Implement user registration persistence
3. Implement password hashing
4. Wire Sign Up page to registration flow
5. Verify redirect to Sign In on success

**Deliverables:**

- Sign Up flow functional end-to-end
- All registration tests passing

---

### Phase 3: Sign In and Session (TDD) — COMPLETED

**Objective:** Registered users can sign in; session persists.

**Tasks:**

1. Write failing integration tests for Sign In and session creation
2. Implement credential verification
3. Implement session creation and storage
4. Wire Sign In page to authentication flow
5. Write failing tests for session persistence across requests
6. Verify redirect to Dashboard on success

**Deliverables:**

- Sign In flow functional end-to-end
- Session persists across page reload
- All sign-in and session tests passing

---

### Phase 4: Logout and Protected Routes (TDD) — COMPLETED

**Objective:** Users can log out; protected routes enforce authentication.

**Tasks:**

1. Write failing tests for logout session clearing
2. Implement logout
3. Write failing tests for protected route redirect behaviour
4. Implement route protection middleware (or equivalent)
5. Create minimal Dashboard placeholder with logout control
6. E2E test: full journey Sign Up → Sign In → Dashboard → Logout → blocked from Dashboard

**Deliverables:**

- Logout functional
- Dashboard and route protection functional
- Full auth E2E test passing

---

### Phase 5: UI Polish, Accessibility, and Hardening — COMPLETED

**Objective:** Meet non-functional requirements for accessibility, responsiveness, and security hardening.

**Tasks:**

1. Accessibility audit and fixes (labels, focus, aria-live for errors)
2. Responsive layout verification on mobile, tablet, desktop
3. Security review (cookie flags, error messages, input sanitization)
4. Performance check on auth operations
5. Final acceptance criteria review

**Deliverables:**

- All acceptance criteria checked
- All tests green
- Lint and build passing

---

## Acceptance Criteria

### Sign Up

- [x] User can access the Sign Up page when not authenticated
- [x] User can register with valid Full Name, Email, Password, and Confirm Password
- [x] All fields show appropriate errors when empty on submit
- [x] Invalid email format shows "Please enter a valid email address."
- [x] Password failing any complexity rule shows the corresponding error message
- [x] Mismatched Confirm Password shows "Passwords do not match."
- [x] Duplicate email shows "An account with this email already exists. Please sign in."
- [x] Successful registration redirects user to Sign In page
- [x] Password is stored hashed, not in plain text

### Sign In

- [x] User can access the Sign In page when not authenticated
- [x] User can sign in with valid registered credentials
- [x] Empty email or password shows required field errors
- [x] Invalid credentials show "Invalid email or password." (same message for wrong email and wrong password)
- [x] Successful sign in redirects to Dashboard
- [x] Session persists after browser refresh while signed in

### Logout

- [x] Authenticated user can log out from Dashboard (or global nav)
- [x] After logout, user is redirected to Sign In
- [x] After logout, accessing Dashboard redirects to Sign In

### Protected Routes

- [x] Unauthenticated user visiting Dashboard is redirected to Sign In
- [x] Authenticated user can access Dashboard without redirect
- [x] Route protection is enforced server-side, not only in the browser

### Non-Functional

- [x] Sign Up and Sign In pages are usable at 320px viewport width
- [x] All form fields have visible labels
- [x] Validation errors are perceivable without relying on colour alone
- [x] All automated tests for auth behaviour pass
- [x] `npm run lint` and `npm run build` succeed with auth changes integrated

---

## Assumptions

1. Email and password is the only authentication method for Sprint 0.
2. A persistent data store compatible with Cloudflare Workers will be selected during Phase 0 (not defined in this PRD).
3. The Dashboard is a placeholder page sufficient to prove authentication; it does not include quiz functionality.
4. One account per email address; no duplicate emails allowed.
5. Users are responsible for remembering their password; password reset is out of scope.
6. Session expiry duration will be decided during implementation (recommended: 7–30 days with sliding expiration, or session cookie until browser close).
7. The project continues to use Next.js 16 App Router, TypeScript, Tailwind CSS v4, and shadcn/ui for UI implementation.
8. English is the only language for Sprint 0; all messages are in English.
9. Testing framework and auth library will be proposed and approved before coding begins, per project working agreements.
10. TDD is mandatory; tests precede implementation for all auth behaviour.

---

## Future Enhancements

The following are intentionally deferred and may be addressed in later sprints:

| Enhancement | Description |
|-------------|-------------|
| Password reset / forgot password | Email-based password recovery flow |
| Email verification | Confirm email ownership before full account access |
| Social login | OAuth with Google, GitHub, or others |
| Remember me | Extended session option on Sign In |
| Multi-factor authentication | TOTP or email OTP |
| User profile page | Edit Full Name, email, password |
| Role-based access control | Admin vs. standard user roles |
| Account deletion | Self-service account removal |
| Redirect after login | Return user to originally requested protected URL |
| Session management UI | View and revoke active sessions |
| Audit logging | Log sign in, sign out, and failed attempts |

---

## Risks and Open Questions

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cloudflare Workers stateless model complicates session storage | Sessions may not persist correctly across isolates | Choose KV, D1, or auth provider with edge-compatible session support early in Phase 0 |
| Auth library incompatibility with OpenNext on Cloudflare | Blocked implementation | Evaluate libraries against `@opennextjs/cloudflare` before committing |
| No testing framework in starter | TDD cannot begin | Add test framework as first task in Phase 0 |
| Password hashing cost on Workers CPU limits | Slow sign up/sign in | Use appropriate work factor; benchmark on Workers runtime |

### User Experience Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Strict password rules frustrate users | Abandonment at Sign Up | Show password requirements upfront; inline strength hints |
| Redirect to Sign In after Sign Up adds friction | Users expect auto-login | Clear success message; consider auto-login as future enhancement |
| Generic Sign In error confuses users | Support burden | Keep message friendly; link to Sign Up and future password reset |

### Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| OQ-01 | Which auth library or custom approach will be used? | Team | **Resolved — Better Auth** (see PHASE_0_IMPLEMENTATION.md) |
| OQ-02 | Which database or storage layer will persist users and sessions? | Team | **Resolved — Cloudflare D1** |
| OQ-03 | What is the session expiry policy (duration, sliding vs. fixed)? | Team | **Resolved — 7 days, sliding** |
| OQ-04 | Should authenticated users visiting `/sign-in` or `/sign-up` be redirected to Dashboard? | Team | Open (recommended: yes) |
| OQ-05 | Should the original URL be preserved when redirecting unauthenticated users to Sign In? | Team | Open (recommended: yes, as enhancement) |
| OQ-06 | Which testing framework: Vitest, Jest, or other? | Team | **Resolved — Vitest** |
| OQ-07 | Is rate limiting required for Sprint 0 or deferred? | Team | **Deferred to Phase 5** |
| OQ-08 | Exact route paths: `/sign-up` vs `/signup`, `/sign-in` vs `/login`? | Team | **Resolved — `/sign-up`, `/sign-in`, `/dashboard`** |

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Sign Up completion rate | > 90% of started registrations succeed on first attempt (in test/staging) | E2E test pass rate; manual QA |
| Sign In success rate | Valid credentials succeed 100% of the time | Automated integration tests |
| Auth test coverage | All behaviours in Acceptance Criteria have automated tests | Test suite review |
| Protected route enforcement | 100% of unauthenticated Dashboard requests redirect | Automated E2E tests |
| Page load on auth forms | Interactive within 3 seconds on 3G (lab test) | Lighthouse or manual timing |
| Accessibility | No critical WCAG violations on Sign Up and Sign In | axe or Lighthouse audit |

---

## Dependencies

### External Dependencies

| Dependency | Purpose | Status |
|------------|---------|--------|
| Authentication library (TBD) | Sign Up, Sign In, session management | **Installed — Better Auth** |
| Persistent storage (TBD) | User records and session data | **Configured — D1 binding (placeholder ID)** |
| Testing framework (TBD) | TDD for all auth behaviour | **Installed — Vitest** |
| Cloudflare Workers / Wrangler | Hosting and runtime | Available (starter) |

### Internal Dependencies

| Dependency | Purpose |
|------------|---------|
| Next.js 16 App Router | Pages, routing, server actions or API routes |
| shadcn/ui + Tailwind CSS v4 | Sign Up and Sign In page styling |
| `@opennextjs/cloudflare` | Production deployment target |

### Environment Variables (anticipated)

Exact names will be defined when auth and storage are chosen. Expect placeholders for:

- Database or storage connection credentials
- Session secret / encryption key
- Auth provider secrets (if applicable)

Local values belong in `.dev.vars`; production values in Wrangler secrets.

---

## Troubleshooting Guide

This section will be populated during implementation as issues are discovered and resolved.

### Template Entry Format

**Problem:** [What goes wrong]
**Cause:** [Why it happens]
**Solution:** [How to fix it]

---

## Notes for AI Agents

When working with this PRD:

1. **Read Scope first.** Sprint 0 is authentication only. Do not implement quiz features.
2. **Follow TDD.** Write failing tests before implementation code for every behaviour.
3. **Do not invent schema or APIs** unless a later sprint explicitly authorizes it; this PRD defines behaviour, not implementation structure.
4. **Ask before adding dependencies.** Propose auth library, database, and test framework with rationale.
5. **Use canonical error messages** from this document; do not paraphrase.
6. **Enforce server-side validation** even when client validation exists.
7. **Update phase status markers** in Implementation Phases as work progresses.
8. **Mark Acceptance Criteria** checkboxes when verified.
9. **Add Troubleshooting entries** when bugs are found and fixed.
10. **Verify with `npm run lint` and `npm run build`** before claiming completion.
11. **Use `npm run preview`** for Workers-runtime-sensitive auth behaviour, not only `npm run dev`.
12. **Keep AGENTS.md Project section updated** when Sprint 0 ships.

---

## Current Status

**Last Updated:** September 4, 2026
**Current Phase:** Sprint 0 Authentication — COMPLETED
**Status:** COMPLETED
**Next Steps:**

Sprint 0 authentication is complete. Future sprints can build quiz features on this foundation.
