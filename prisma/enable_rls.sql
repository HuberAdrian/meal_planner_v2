-- Lock down the Supabase Data API (PostgREST / GraphQL / supabase-js).
--
-- Why this is safe for this app:
--   The app reaches Postgres ONLY through Prisma's direct connection
--   (DATABASE_URL / DIRECT_URL), connecting as the table-owner role, which
--   BYPASSES row-level security. Enabling RLS with NO policies makes the
--   public Data API (reachable with the public anon key, outside of Clerk)
--   deny all reads/writes, while Prisma keeps working untouched.
--
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor).
-- Idempotent: safe to re-run.

-- NOTE: plain ENABLE (not FORCE). The table owner / postgres role that
-- Prisma connects as bypasses RLS automatically, so the app is unaffected.
-- FORCE would apply RLS to the owner too and would break Prisma's queries.
ALTER TABLE "Post"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Meal"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ItemGroceryList" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense"         ENABLE ROW LEVEL SECURITY;

-- Belt-and-suspenders: revoke Data API role grants so the tables are not
-- exposed even if a permissive policy is ever added by mistake.
REVOKE ALL ON "Post", "Meal", "ItemGroceryList", "Expense"
  FROM anon, authenticated;

-- Verify: every row below should show rowsecurity = true.
-- SELECT relname, relrowsecurity, relforcerowsecurity
-- FROM pg_class
-- WHERE relname IN ('Post','Meal','ItemGroceryList','Expense');
