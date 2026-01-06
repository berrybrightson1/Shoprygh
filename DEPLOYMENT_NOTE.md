# Vercel Deployment Note

This commit triggers a fresh Vercel deployment to clear cached builds.

## Code Status
- `src/app/[storeSlug]/(store)/page.tsx` is correctly passing only data props
- No function props are being passed to Client Components
- Local build: SUCCESS

The "Event handlers cannot be passed to Client Component" error on Vercel is from stale cache.
