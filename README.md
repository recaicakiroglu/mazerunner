# MazeRunner

A TV show discovery app built with Vue 3, Pinia, and TypeScript, powered by the [TVMaze public API](https://www.tvmaze.com/api).

**Live demo**: [tvmazerunner.netlify.app](https://tvmazerunner.netlify.app)

---

![MazeRunner](https://github.com/user-attachments/assets/e100367a-953e-4446-be87-56131ec8b7f5)

---

![MazeRunner](https://github.com/user-attachments/assets/26755cd8-30e9-4e01-8eaf-10f6c908122c)

---

## Getting Started

**Requirements**

| Node.js | v22.16.0 |
| ------- | -------- |
| npm     | v10.9.2  |

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Type check + production build
npm run build

# Preview production build locally
npm run preview
```

The app runs on `http://localhost:5173` by default.

> No API key or environment variables needed — TVMaze is a public API.

---

## Tech Stack

| Framework | Vue 3 (Composition API) |
| --------- | ----------------------- |
| Language  | TypeScript              |
| Build     | Vite                    |
| State     | Pinia                   |
| Router    | Vue Router 4            |
| Styling   | Tailwind CSS            |
| Tests     | Vitest + Vue Test Utils |
| Linting   | ESLint + Prettier       |

### Library Choices

**Tailwind CSS** — personal preference after years of use. The utility-first approach fits component-scoped styling well and removes the overhead of managing class names and CSS files separately.

**vue-virtual-scroller** — virtual scrolling is genuinely complex to implement correctly (row height calculation, scroll position sync, recycling). Using an established library here was the pragmatic call; the effort would not have been justified when the goal was performance, not reinventing the wheel.

---

## Requirements

### Functional

- Browse shows grouped by genre, sorted by rating (descending) within each genre
- Infinite scroll per genre — load more shows as the user scrolls
- Search shows by title
- Favorite shows, persisted across sessions
- Show detail page with full metadata

### Non-Functional

- **Performance**: Smooth scrolling with thousands of items visible — no frame drops
- **Memory**: Memory growth is unbounded but negligible in practice — worst case ~36 MB
- **Responsiveness**: Layout adapts from mobile (minimum 2 columns) to desktop (5 columns)
- **Perceived speed**: Genre switching feels instant; no full-page loading states on transition
- **Accessibility**: Semantic HTML throughout, ARIA roles and labels on all interactive elements, keyboard-navigable tabs and dropdowns — Lighthouse accessibility score: 95

---

## The Core Problem: TVMaze Has No Genre Endpoint

TVMaze exposes shows paginated via `/shows?page=N` — returning ~250 shows per page across ~366 pages (~91,000 shows total). It does **not** offer a `/shows?genre=Action` endpoint. Genre information is embedded inside each show object.

This means: **to show genre-separated content, you must fetch and classify shows yourself.**

Two naive approaches fail:

| Approach                                | Problem                                                       |
| --------------------------------------- | ------------------------------------------------------------- |
| Fetch all 366 pages on load             | 366 API calls, minutes of loading, rate limiting              |
| Fetch pages separately per genre switch | Re-fetches the same pages repeatedly, same rate limit problem |

### Solution: Lazy Pagination with Cross-Genre Indexing

Pages are fetched **on demand** — starting with page 0, then continuing as the user scrolls. Each fetched page is distributed across **all genre buckets simultaneously**. A single page fetch advances every genre at once.

```
Fetch page 5  →  page 5 contains: Action×12, Drama×8, Crime×5 ...
                 → all shows classified into their genre buckets
                 → currentPage advances globally, shared across all genres
```

This ensures no page is ever fetched twice, regardless of which genre triggered the load.

---

## Problem 1: DOM Size with Thousands of Cards

Rendering 2,000+ show cards as real DOM nodes causes severe performance problems — layout thrashing, slow paint, and memory pressure from thousands of element references.

### Solution: Virtual Scrolling (RecycleScroller)

The app uses `vue-virtual-scroller`'s `RecycleScroller`, which renders only the rows currently in the viewport plus a small buffer. Off-screen rows are recycled and re-used with new data.

This requires a **fixed pixel row height** — the scroller cannot measure rows dynamically. It's calculated in `useRecycleScrollerLayout`.

---

## Problem 2: Memory Growth from Infinite Scroll

As the user scrolls, shows accumulate in memory. The question is whether this growth ever becomes a real problem.

### Back-of-the-envelope

The store keeps only `Show` objects — a deliberately minimal type:

```ts
interface Show {
  id: number // 8 bytes
  name: string // ~30 bytes avg
  genres: string[] // ~50 bytes avg
  rating: { average: number | null } // ~16 bytes
  image: { medium: string; original: string } | null // ~120 bytes (URLs)
}
// ≈ ~400 bytes per Show (including V8 object overhead)
```

`ShowDetail` — which adds `summary`, `status`, `language`, `runtime`, `premiered`, `ended`, `officialSite`, `schedule`, `network`, `webChannel` — is never kept in memory. It is fetched on demand and exists only for the duration of the detail page visit, keeping the per-show footprint roughly 5–6× smaller than full detail objects. Cast members are fetched separately via `/shows/:id/cast` and discarded alongside the detail when the user navigates away.

TVMaze has ~91,000 shows across 366 pages (~250 per page). How many would a real user actually load?

Each scroll trigger fetches `LOAD_MORE_PAGES` (currently 10) pages at once — ~2,500 shows per trigger.

| Scenario                            | Scroll triggers | Shows loaded | Memory  |
| ----------------------------------- | --------------- | ------------ | ------- |
| Typical session (3–4 triggers)      | 3–4             | ~6,000       | ~2.4 MB |
| Heavy session (~10 triggers)        | ~10             | ~25,000      | ~10 MB  |
| Theoretical maximum (all 366 pages) | ~35             | ~91,000      | ~36 MB  |

Reaching the theoretical maximum requires ~35 deliberate scroll-to-bottom actions. It doesn't happen in practice.

### Decision: No eviction limit

A per-genre eviction cap was considered. The analysis showed it is not worth the trade-off:

- **Memory cost is negligible** — even extreme sessions stay well under 40 MB, which is a rounding error on any modern device
- **UX cost is real** — capping means a user returning to a previously browsed genre loses their scroll history and must re-fetch shows they already saw
- **Code cost is real** — eviction logic adds complexity (rated/unrated prioritisation, per-genre tracking) for a problem that does not exist at these sizes

All fetched shows are kept in memory for the session — no eviction.

---

## Problem 3: Re-render Noise from Single-Page Fetches

Fetching one page at a time during infinite scroll means the UI re-renders on every page — each fetch triggers a new `activeShows` update, a new RecycleScroller layout pass, and a visible content shift as new cards appear. With a fast network, this produces a rapid stutter of partial updates instead of one smooth addition.

### Solution: Bulk Fetching (`LOAD_MORE_PAGES` in Parallel)

When the user scrolls past the sentinel, the store fetches `LOAD_MORE_PAGES` pages simultaneously via `Promise.all`, processes all results together, and updates `activeShows` exactly once.

```
loadMore triggered
  → Promise.all(pages N … N+LOAD_MORE_PAGES-1)
  → classify all shows into genre buckets
  → sort once
  → activeShows updated once
  → one RecycleScroller render
```

---

## Problem 4: Rating Sort Without Re-sorting on Every Scroll

Each page fetch appends new shows. Re-sorting the active genre's array on every page load causes visible cards to jump positions mid-scroll — a jarring UX issue.

### Solution: Separate Rated / Unrated Buckets + Lazy Sort

Each genre maintains two arrays: `rated[]` and `unrated[]`. Rated shows always appear before unrated ones structurally, without requiring a sort.

Full `ratingSort` (descending, nulls last) runs only at:

1. **Initial load** — all genres sorted once after the initial pages (`INITIAL_PAGES`) are processed
2. **Genre activation** — sorted once when the user switches to a genre

---

## Architecture Overview

The project uses a feature-based folder structure:

```
src/
├── api/
│   └── tvmaze.ts                          # API layer — maps raw TVMaze responses to domain types
├── features/
│   ├── shows/
│   │   ├── store/
│   │   │   └── shows.ts                   # Core store: genre indexing, pagination, rating sort
│   │   ├── components/
│   │   │   ├── ShowCard.vue               # Single show card
│   │   │   ├── ShowGrid.vue               # Responsive grid wrapper (Home / Search / Favorites)
│   │   │   └── ShowDetail.vue             # Full detail layout with tabs
│   │   ├── composables/
│   │   │   ├── useRecycleScrollerLayout.ts  # Column count + pixel row height for RecycleScroller
│   │   │   └── useInfiniteScroll.ts         # IntersectionObserver-based sentinel trigger
│   │   ├── utils/
│   │   │   └── showFormatters.ts          # Builds display-ready metadata fields for detail page
│   │   └── views/
│   │       ├── HomeView.vue               # Genre rows with top-rated shows
│   │       ├── BrowseView.vue             # Virtual infinite-scroll grid per genre
│   │       └── DetailView.vue             # Show detail page
│   ├── favorites/
│   │   ├── store/
│   │   │   └── favorites.ts              # Favorites persisted to localStorage
│   │   └── views/
│   │       └── FavoritesView.vue
│   └── search/
│       └── views/
│           └── SearchView.vue             # Search results
├── shared/
│   ├── components/
│   │   ├── AppHeader.vue                 # Sticky header with nav, search, mobile menu
│   │   ├── BaseButton.vue
│   │   ├── FavoriteButton.vue            # Reusable favorite toggle (card + detail)
│   │   ├── GenresDropdown.vue
│   │   ├── LoadingSpinner.vue
│   │   ├── MobileNav.vue
│   │   ├── RatingBadge.vue
│   │   └── SearchInput.vue
│   ├── composables/
│   │   ├── useDebounce.ts               # Generic debounce with auto-cleanup on unmount
│   │   ├── useErrorToast.ts             # Shows toast on store error
│   │   └── useHeaderSearch.ts           # Debounced search input wired to router query
│   └── utils/
│       └── ratingSort.ts                # Shared comparator — descending, nulls last
├── router/
│   └── index.ts
├── config.ts                            # App-wide constants (page sizes, debounce ms, storage keys)
└── types/
    └── index.ts                         # Show, ShowDetail, CastMember
```

### Key Type Design

`Show` is the lightweight type used everywhere (cards, genre lists, search results). `ShowDetail` extends it with the full metadata needed only on the detail page. The API layer maps raw TVMaze responses to these types at the boundary — the rest of the app never deals with raw API shapes.

---

## Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

### Philosophy

Tests are written from the user's perspective — what a user can see, click, and experience — not from the perspective of internal implementation details.

This means:

- Don't test which URL was called internally
- Don't test whether a loading flag flipped from `true` to `false`
- Test what appears on screen after an action
- Test whether clicking something changes what the user sees

### User Flows

**Discovery — browsing shows by genre**

| User action                                         | Tested |
| --------------------------------------------------- | ------ |
| "See All" links carry the correct genre query param | ✅     |
| Clicking a show card navigates to the detail page   | ✅     |

**Search — finding a show by title**

| User action                                     | Tested |
| ----------------------------------------------- | ------ |
| Search results appear on screen after query     | ✅     |
| "No results" message shown when nothing matches | ✅     |
| Error message shown when search fails           | ✅     |

**Detail page — exploring a show**

| User action                                           | Tested |
| ----------------------------------------------------- | ------ |
| Overview tab is active by default                     | ✅     |
| Clicking "Cast" tab shows cast members                | ✅     |
| Clicking "Details" tab shows metadata                 | ✅     |
| Empty cast state is shown when no cast available      | ✅     |
| Back button calls `router.back()` when history exists | ✅     |
| Back button navigates to home when no history         | ✅     |

**Favorites — saving shows**

| User action                                     | Tested |
| ----------------------------------------------- | ------ |
| Clicking the heart button toggles favorite      | ✅     |
| Clicking again removes it from favorites        | ✅     |
| Favorites survive a page refresh (localStorage) | ✅     |
| Favorites are restored from storage on load     | ✅     |
| Corrupted storage does not crash the app        | ✅     |

**Show card — rendering**

| Behaviour                                 | Tested |
| ----------------------------------------- | ------ |
| Renders show name, poster, and rating     | ✅     |
| Shows placeholder when no image available | ✅     |
| Renders "N/A" when rating is null         | ✅     |
| Card links to the correct detail page     | ✅     |

### Store — user-observable behaviour

| Behaviour                                       | Tested |
| ----------------------------------------------- | ------ |
| Shows with multiple genres appear in each genre | ✅     |
| Shows with no genres are excluded               | ✅     |
| Shows sorted by rating, unrated last            | ✅     |
| Genre list sorted alphabetically                | ✅     |
