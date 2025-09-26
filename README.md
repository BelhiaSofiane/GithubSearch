# GitHub User Search — Frontend (React)

**Project:** A small junior-friendly React app that searches GitHub users using the GitHub Search API and demonstrates pagination, loading states, error handling, retry with exponential backoff, and basic accessibility.

---

## Features

* Search GitHub users by username.
* Server-side pagination (uses `per_page` and `page` query params).
* Retry with exponential backoff for transient failures.
* Loading skeleton UI while requests are in progress.
* Clear error UI with accessible announcements (`role="alert"` / `role="status"`).
* `ReactPaginate` integration with controlled `forcePage` so pagination UI matches component state.
* Defensive handling for HTTP vs network errors.

---

## Files

* `App.css` — small styles used by the app (skeletons, pagination, results).
* `App.jsx` (or `App.js`) — main React component with search, fetch logic and pagination.

---

## Quick start (run locally)

1. Make sure you have Node.js (v16+) and npm or yarn installed.

2. Clone or copy this project into a React app (Create React App / Vite / etc.).

3. Install dependencies (example with npm):

```bash
npm install react-paginate
# plus the rest of your React toolchain (Create React App / Vite / etc.)
```

4. Start the dev server:

```bash
npm start
```

Open the app in your browser (usually [http://localhost:3000](http://localhost:3000) or [http://127.0.0.1:5173](http://127.0.0.1:5173) depending on your setup).

---

## Important implementation details & notes

### 1. GitHub Search API limits

* The GitHub Search API default `per_page` is **30** results per request.
* You can set `per_page` up to **100** (maximum allowed by GitHub). Requests using a larger `per_page` value (for example `10000`) will be ignored or clamped by the API — use at most 100.
* The Search API is capped to the first **1000** results. Even if `total_count` is higher, you cannot fetch beyond the 1000-results window.

If you want to request more per page, update the fetch URL to include `&per_page=${itemsPerPage}&page=${page}` and ensure `itemsPerPage <= 100`.

### 2. Rate limiting

* Unauthenticated requests are limited. If you plan heavy testing, create a Personal Access Token (PAT) and pass it in the `Authorization` header to increase your quota.
* **Do not commit tokens to a public repo.** Use environment variables or a `.env` file for local development.

Example header usage:

```js
fetch(url, {
  headers: {
    Authorization: `token ${process.env.REACT_APP_GITHUB_TOKEN}`
  }
})
```

### 3. Pagination and `ReactPaginate`

* Use `forcePage={currentPage}` to make the pagination UI controlled. That ensures the `.active` class reflects the `currentPage` state when you reset it (for example when query changes).
* GitHub page numbers are **1-based**, while `ReactPaginate` `selected` is **0-based**. Convert between them when calling your fetch function.

### 4. Resetting page to 0 behavior

* If you want the pagination to jump visually to page 1 when the search query changes, call `setCurrentPage(0)` when the query changes (or before you trigger the fetch). Also ensure `ReactPaginate` receives `forcePage={currentPage}`.

### 5. Accessibility

* Announce status changes with a polite live region: `role="status" aria-live="polite"`.
* Announce immediate errors with `role="alert"` so assistive tech announces them right away.
* Use `aria-describedby` on the search input to point to the error element when there is an error.
* Ensure keyboard users can trigger search with Enter and navigate paginated results.

---

## Troubleshooting

* **Only 30 results returned** — remember to add `per_page` and `page` query params. Example: `?q=foo&per_page=50&page=1` (max `per_page` is 100).
* **Active page not updating visually** — ensure `forcePage={currentPage}` is set on `ReactPaginate` and that your CSS targets `.pagination li.active` or `.pagination li.active a`.
* **Rate limit / 403** — add an Authorization token or reduce frequency of requests.
* **Stale results showing** — consider using `AbortController` to cancel previous requests when a new search is started.

---

## Suggested improvements (next steps / interview talking points)

* Add input debounce (e.g., 300ms) to avoid firing requests on every keystroke.
* Add `AbortController` to cancel previous requests and avoid race conditions.
* Respect the GitHub API `X-RateLimit-Remaining` / `X-RateLimit-Reset` headers to show friendly messages when rate-limited.
* Add unit tests for `retryWithBackoff` (mock fetch behavior) and integration tests for fetch+pagination behavior.
* Add loading skeleton animations and polish accessible focus management (focus result on search completion, focus error on failure).

---

## Example: Minimal fetch update for server-side pagination

```js
// itemsPerPage must be <= 100
const itemsPerPage = 30;

async function fetchUsers(q, page = 1) {
  const url = `https://api.github.com/search/users?q=${encodeURIComponent(q)}&per_page=${itemsPerPage}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  // note: GitHub caps results at 1000
  return data;
}
```

---

## License & credits

* This project is educational and intended for interview / learning practice.
* Feel free to reuse, adapt, and improve for your own learning.

---

If you want, I can also:

* Produce a small **CHANGELOG** of precise code changes to apply to your current `App.js` (diff style) so you can paste-in the edits.
* Create a short **README badge** or cover image.

Which of those (if any) would you like next?
