-- Add sort_order column to tasks table
-- Run this in Supabase SQL Editor

ALTER TABLE public.tasks ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

-- Backfill: assign sequential sort_order per user per tier based on created_at
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, tier ORDER BY created_at) - 1 AS rn
  FROM public.tasks
)
UPDATE public.tasks SET sort_order = numbered.rn
FROM numbered WHERE public.tasks.id = numbered.id;
