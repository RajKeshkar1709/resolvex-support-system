# ResolveX — Technical Interview Preparation Guide
## 35 Comprehensive Full-Stack Interview Questions & Answers

---

### Core Architecture & System Design

#### Q1: What architectural pattern does the ResolveX backend follow, and why?
**Answer:** ResolveX follows a layered, service-oriented MVC architecture with decoupled event-driven listeners.
1. **Routes:** Define the API endpoints and wire validation and security middlewares.
2. **Controllers:** Deal strictly with the HTTP transport layer (parsing headers, query parameters, request bodies, and formatting JSON responses).
3. **Services:** Contain pure business logic, database queries, and state-machine rules.
4. **Events:** Handle asynchronous side-effects (auditing and notifications) without blocking the client's HTTP response.

#### Q2: How is the Event-Driven Architecture implemented in ResolveX?
**Answer:** It uses Node.js `EventEmitter` wrapped in a singleton `eventBus`. When an action completes (such as `ticketService.createTicket()`), the service emits an event (`ticket.created`). Independent listeners in `events/listeners/` receive this event and asynchronously persist `ActivityLog` records and dispatch `Notification` records.

#### Q3: What are the limitations of Node.js EventEmitter in production, and how would you scale it?
**Answer:** `EventEmitter` runs in-memory within a single Node.js process. In a distributed multi-instance deployment (e.g., across multiple Docker containers or Kubernetes pods), events emitted on Instance A are not heard by listeners on Instance B. Furthermore, if the process crashes, unhandled events are lost. To scale this for high availability, we would replace the local EventEmitter with a distributed message broker like Redis Pub/Sub, BullMQ, or RabbitMQ.

#### Q4: Why did we separate the ActivityLogs and Notifications collections?
**Answer:**
- **ActivityLogs** serve as an immutable compliance audit trail capturing system events, actor references, and before/after metadata. They cannot be edited or deleted by users.
- **Notifications** are user-facing operational alerts with mutable state (`isRead: boolean`, `readAt: Date`) tailored to individual recipients.

---

### Database & MongoDB Design

#### Q5: How are MongoDB indexes chosen in ResolveX?
**Answer:**
- `Users`: Unique index on `email` to guarantee unique accounts and $O(1)$ lookups during authentication.
- `Tickets`: Unique index on `ticketNumber`. Compound text index on `{ title: 'text', description: 'text' }` for search. Compound index on `{ createdBy: 1, createdAt: -1 }` to optimize sorting the user's tickets by recency.
- `Notifications`: Compound index on `{ recipient: 1, isRead: 1, createdAt: -1 }` to support fetching unread notifications instantly.
- `ActivityLogs`: Index on `{ ticket: 1, createdAt: -1 }` to quickly render chronological ticket timelines.

#### Q6: How is the unique ticket number (e.g., RES-2026-1001) generated safely?
**Answer:** The helper `ticketNumberGen.js` performs an atomic lookup of the latest created ticket matching the prefix `RES-YYYY-`, increments the integer sequence, and sets the new identifier. In MongoDB, a unique index on `ticketNumber` prevents duplicate collisions.

#### Q7: Why do we use `select: false` on the User schema password field?
**Answer:** To guarantee defense-in-depth against accidental password leakage. Even if a developer queries `User.find()`, Mongoose excludes the hashed password unless `.select('+password')` is explicitly requested in authentication routines.

---

### Security & Authentication

#### Q8: How does ResolveX store and verify authentication tokens?
**Answer:** We issue JSON Web Tokens (JWT) stored in `HttpOnly`, `SameSite: 'lax'` (or `'strict'`) cookies.
- **HttpOnly:** JavaScript running in the browser cannot access `document.cookie`, preventing Cross-Site Scripting (XSS) token theft (which occurs when tokens are placed in `localStorage`).
- Short-lived Access Token (15m) + Long-lived Refresh Token (7d).

#### Q9: How does ResolveX prevent privilege escalation?
**Answer:**
1. Public registration endpoint hardcodes `role: ROLES.USER`.
2. Admin accounts can only be seeded using the server-side seed script (`npm run seed:admin`).
3. User update APIs reject any modifications to the `role` field.
4. The authenticated user identity and role are verified server-side from the verified JWT on every request.

#### Q10: What is Object-Level Authorization, and where is it enforced?
**Answer:** Role checks verify *who* you are (e.g. USER), but Object-Level Authorization verifies *what* resource you own. For example, a customer should only be able to view and comment on their own tickets. ResolveX enforces this inside `ticketService` and `commentService` by asserting `ticket.createdBy.toString() === req.user.id.toString()`.

---

### Redux Toolkit & Frontend State Management

#### Q11: Explain the flow of data from a React component through Redux Toolkit to the API and back.
**Answer:**
1. **Component:** Calls `dispatch(createTicket(formData))`.
2. **Thunk (`ticketThunks.js`):** `createAsyncThunk` executes and calls `ticketApi.createTicket(formData)`.
3. **Axios Client (`axiosClient.js`):** Sends HTTP POST to `/api/tickets` with `withCredentials: true`.
4. **Backend:** Authenticates, persists ticket, emits event, and returns 201 JSON.
5. **Thunk Action Dispatch:** `createAsyncThunk` automatically dispatches `tickets/createTicket/fulfilled` with the returned payload.
6. **Slice Reducer (`ticketSlice.js`):** `extraReducers` catches `fulfilled`, appends the new ticket to `state.items`, and resets `actionLoading`.
7. **Selector (`ticketSelectors.js`):** Component receives the updated list via `useSelector(selectTickets)` and re-renders.

#### Q12: Why are we using Redux Toolkit with `createAsyncThunk` instead of RTK Query or TanStack Query?
**Answer:**
- Strict adherence to the assignment's explicit architectural guidelines.
- Full, deterministic control over every async lifecycle state (`pending`, `fulfilled`, `rejected`) and state transformations inside normalized slices.
- Eliminates abstraction layers, demonstrating deep understanding of Redux core mechanics, immutability (via Immer inside `createSlice`), and action dispatching.

#### Q13: What is the purpose of React Context API in this application?
**Answer:** Context API is reserved strictly for UI-level presentation state (such as theme toggling and sidebar collapse/expand). It is intentionally decoupled from domain business entities (User, Tickets, Comments) to prevent state duplication and unnecessary component re-renders.

---

### Testing & Quality Assurance

#### Q14: How does the test suite run without an active external MongoDB server?
**Answer:** We integrate `mongodb-memory-server` in `tests/setup.js`. It boots an ephemeral, in-memory MongoDB binary in Node during test execution and tears it down after tests finish. This enables reproducible, fast CI/CD execution without local MongoDB installation prerequisites.

#### Q15: What scenarios are covered in the automated tests?
**Answer:**
- User registration and duplicate email rejection.
- Password hashing verification (not plaintext in DB).
- JWT cookie transmission.
- Unauthorized access prevention (USER blocked from ADMIN routes).
- State machine transition validation (`OPEN` -> `IN_PROGRESS` -> `RESOLVED` -> `CLOSED` and invalid transition rejections).
- Event bus verification (ticket creation produces an activity log and admin notification).
- Ticket comments authorization and counterpart notification.
