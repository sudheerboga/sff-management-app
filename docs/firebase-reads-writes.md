# Firebase Reads & Writes — Boutiqo

## Free Tier Limits (Spark Plan)

| Resource | Free Daily Limit |
|---|---|
| Reads | 50,000 / day |
| Writes | 20,000 / day |
| Deletes | 20,000 / day |
| Storage | 1 GiB total |

---

## How Reads Are Counted

Every document returned by a Firestore query counts as **1 read**.

- A query returning 25 orders = **25 reads**
- Pagination uses `limit(26)` to detect "has more" = **26 reads per page**
- Fetching all 200 orders at once = **200 reads**
- A single `getDoc()` call = **1 read**

---

## Reads Per Operation

### Orders Page (Paginated)

| Action | Reads |
|---|---|
| Open dashboard (page 1) | 26 |
| Navigate to page 2, 3, 4… | 26 per page |
| Search by name or phone (first time) | N (all orders) |
| Search again within cache window | 0 (cached) |
| Clear search → back to pages | 0 (page data still cached) |

### Mutations (Create / Edit / Delete)

| Mutation | Writes | Reads triggered |
|---|---|---|
| Create new order | 1 | 26 (page refresh) + full list invalidated |
| Edit order (items / amount) | 1 | 26 (page refresh) + full list invalidated |
| Delete order | 1 | 26 (page refresh) + full list invalidated |
| Change status (in-progress → delivered) | 1 | 26 (page refresh only) |
| Add payment | 1 | 26 (page refresh only) |
| Update material cost | 1 | 26 (page refresh only) |

> **Why the difference?** Create, edit, and delete change the order list itself (new record appears / disappears / amounts change) so Reports and Customers must also refresh. Status and payment changes only update a field inside an existing order — Reports and Customers can stay cached.

### Other Pages

| Page visit | Reads |
|---|---|
| Reports | N (all orders, once per cache window) |
| Customers | N (all orders) + C (all customers) |
| Measurements | M (all measurements) |
| Staff | S (all staff members) |

---

## Before Optimisation vs After

**Test scenario:** Boutique with 200 orders, 1 admin user, active 2-hour session.  
Actions: 8 page navigations, 10 status changes, 3 payment entries, 2 Reports visits, 2 Customers visits, 3 searches.

### Before (staleTime = 30s, all mutations invalidate everything)

| Action | Reads |
|---|---|
| Open dashboard + 8 page navigations | 9 × 26 = **234** |
| 10 status changes (page re-fetch each time) | 10 × 26 = **260** |
| 10 status changes → full list marked stale | — |
| 2 Reports visits (full refetch, list was stale) | 2 × 200 = **400** |
| 2 Customers visits (full refetch, list was stale) | 2 × (200 + 30) = **460** |
| 3 searches (60s cache, each re-fetches if gap > 60s) | up to 3 × 200 = **600** |
| 3 payment entries → page refetch | 3 × 26 = **78** |
| **Total** | **~2,032 reads** |

### After (staleTime = 5 min, selective invalidation)

| Action | Reads |
|---|---|
| Open dashboard + 8 page navigations | 9 × 26 = **234** |
| 10 status changes (page re-fetch each time) | 10 × 26 = **260** |
| 10 status changes → full list NOT invalidated | 0 |
| 2 Reports visits (cache still fresh, no refetch) | **0** |
| 2 Customers visits (cache still fresh, no refetch) | **0** |
| 3 searches (5 min cache, only 1 actual fetch) | 1 × 200 = **200** |
| 3 payment entries → page refetch only | 3 × 26 = **78** |
| **Total** | **~772 reads** |

**Reduction: ~62% fewer reads** from the same session.

---

## Daily Estimate by Boutique Size

Assumptions: 1 admin + 2 staff, active 8-hour day, 50 order updates, 10 page visits each to Reports and Customers.

### Before optimisation

| Orders | Est. reads/day | % of free limit |
|---|---|---|
| 100 orders | ~3,500 | 7% |
| 200 orders | ~6,000 | 12% |
| 500 orders | ~14,000 | 28% |
| 1,000 orders | ~26,000 | 52% |

### After optimisation

| Orders | Est. reads/day | % of free limit |
|---|---|---|
| 100 orders | ~1,200 | 2.4% |
| 200 orders | ~1,800 | 3.6% |
| 500 orders | ~3,500 | 7% |
| 1,000 orders | ~6,000 | 12% |

---

## Cache Windows (staleTime)

Data is served from local cache within the stale window. No Firestore read happens.

| Data | Cache window | Re-fetches when |
|---|---|---|
| Paginated orders (dashboard) | 5 minutes | Mutation happens or 5 min expires |
| Search results (all orders) | 5 minutes | New mutation or 5 min expires |
| Full orders list (reports, customers) | 5 minutes | Create/delete/edit mutation or 5 min |
| Customers | 5 minutes | Customer mutation or 5 min |
| Measurements | 5 minutes | Measurement mutation or 5 min |

---

## What Would Push You Over the Free Limit

You would approach the 50,000 read limit only if:

- **500+ orders** AND **4+ active users** all working simultaneously with heavy Reports/Customers usage
- Someone keeps refreshing the app constantly (page reload clears cache → full re-fetch on every reload)
- Multiple browser tabs open (each tab has its own TanStack Query cache)

**Recommendation:** You are safe on the free tier for a typical single-boutique setup up to ~1,000 orders and 5 concurrent users. Consider the **Blaze (pay-as-you-go) plan** only when you consistently cross 30,000 reads/day. At Firestore pricing, 50,000 extra reads costs $0.03 — negligible.

---

*Last updated: May 2026*
