-- Fix tags table: change id from uuid to text so it matches task.tag values
-- Run this in Supabase SQL Editor

-- 1. Drop existing tags and fix column type
DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'tina.chelle@gmail.com';
  IF uid IS NULL THEN
    RAISE EXCEPTION 'User tina.chelle@gmail.com not found';
  END IF;

  -- Remove existing tags for this user
  DELETE FROM public.tags WHERE user_id = uid;
END $$;

-- 2. Change id column from uuid to text
ALTER TABLE public.tags DROP CONSTRAINT tags_pkey;
ALTER TABLE public.tags ALTER COLUMN id SET DEFAULT NULL;
ALTER TABLE public.tags ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.tags ADD PRIMARY KEY (id);

-- 3. Seed tags with string ids that match task.tag values
DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'tina.chelle@gmail.com';

  INSERT INTO public.tags (id, user_id, label, color, bg, border) VALUES
    ('work',     uid, 'Work',     '#1348b0', '#e7effd', '#b3caf5'),
    ('personal', uid, 'Personal', '#5e28b8', '#f2eaff', '#cdb3f0'),
    ('health',   uid, 'Health',   '#166638', '#e5f8ef', '#9cd8b8'),
    ('home',     uid, 'Home',     '#7a4d00', '#fff6e0', '#eacf7a'),
    ('move',     uid, 'Move',     '#2a6e4a', '#e8f5ee', '#9cd8b8'),
    ('hobby',    uid, 'Hobby',    '#961870', '#fde7f5', '#f0aad8'),
    ('kids',     uid, 'Kids',     '#1a6ea8', '#e8f4ff', '#9cc8f0');

  RAISE NOTICE 'Seeded 7 tags for user %', uid;
END $$;
