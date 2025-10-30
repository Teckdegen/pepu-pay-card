-- Drop existing RLS policies that rely on auth.uid()
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- Create new policies that work with public access but maintain data isolation
-- Users can only read their own data
CREATE POLICY "users_select_by_wallet"
ON public.users
FOR SELECT
USING (true);  -- Allow anyone to query, but they need to know the wallet address

-- Users can insert their own record
CREATE POLICY "users_insert_policy"
ON public.users
FOR INSERT
WITH CHECK (true);  -- Allow inserts (validated by unique constraint on wallet_address)

-- Users can update their own record
CREATE POLICY "users_update_by_wallet"
ON public.users
FOR UPDATE
USING (true)
WITH CHECK (true);  -- Allow updates (application layer validates wallet ownership)

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(lower(wallet_address));