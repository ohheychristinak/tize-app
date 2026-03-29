-- Seed script for Tize App
-- Run this in the Supabase SQL Editor
-- Seeds tasks and routine config for user tina.chelle@gmail.com

DO $$
DECLARE
  uid uuid;
BEGIN
  -- Get user ID
  SELECT id INTO uid FROM auth.users WHERE email = 'tina.chelle@gmail.com';
  IF uid IS NULL THEN
    RAISE EXCEPTION 'User tina.chelle@gmail.com not found';
  END IF;

  -- ══════════════════════════════════════════════════════════════════════
  -- TASKS
  -- ══════════════════════════════════════════════════════════════════════

  -- Today
  INSERT INTO public.tasks (user_id, tier, text, tag, note, subtasks) VALUES
  (uid, 'today', 'Monique visit — confirm arrival plan', 'personal', NULL, '[]'::jsonb),

  (uid, 'today', 'Clean guest bathroom', 'home', 'Full prep for Monique',
   '[{"id":"tb1","text":"Sink — clean and wipe down","done":false},
     {"id":"tb2","text":"Mirror — streak-free","done":false},
     {"id":"tb3","text":"Toilet — full clean","done":false},
     {"id":"tb4","text":"Remove kids toys","done":false},
     {"id":"tb5","text":"Organize toothbrushes","done":false},
     {"id":"tb6","text":"Clear vanity","done":false},
     {"id":"tb7","text":"Set out fresh towels","done":false}]'::jsonb),

  (uid, 'today', 'Downstairs setup', 'home', 'Entry, furniture, kitchen dishes',
   '[{"id":"te1","text":"Clear entry space","done":false},
     {"id":"te2","text":"Sort out furniture arrangement","done":false},
     {"id":"te3","text":"Kitchen dishes done","done":false}]'::jsonb),

  -- Tomorrow
  (uid, 'tomorrow', 'Dentist 7am', 'health', 'Set alarm tonight', '[]'::jsonb),

  (uid, 'tomorrow', 'Jess Eldredge — management frameworks', 'work', NULL,
   '[{"id":"t5a","text":"Pull management resources","done":false},
     {"id":"t5b","text":"Write 3 talking points","done":false},
     {"id":"t5c","text":"Prep Hobbs situation","done":false}]'::jsonb),

  (uid, 'tomorrow', 'Send A''Nita design systems brief', 'work', NULL, '[]'::jsonb),

  -- Midweek
  (uid, 'midweek', 'Health Plus — illustrations', 'work', NULL, '[]'::jsonb),
  (uid, 'midweek', 'Hobbs transition plan', 'work', NULL, '[]'::jsonb),
  (uid, 'midweek', 'Coforma rebrand moodboards', 'work', NULL, '[]'::jsonb),

  -- Lateweek
  (uid, 'lateweek', 'Ann: Confluence templates review', 'work', NULL, '[]'::jsonb),
  (uid, 'lateweek', 'Music video — review latest cut', 'hobby', NULL, '[]'::jsonb),

  -- Next week
  (uid, 'nextweek', 'Feedback for 6 direct reports', 'work', 'Due mid-April', '[]'::jsonb),
  (uid, 'nextweek', 'Tough talk with Hobbs', 'work', NULL, '[]'::jsonb),
  (uid, 'nextweek', 'Tell Eric summer custody dates', 'kids', NULL, '[]'::jsonb),

  -- This month
  (uid, 'thismonth', 'Realtor inspection prep — 4/11', 'move', 'Buyers may begin access after',
   '[{"id":"t15a","text":"Declutter all visible surfaces","done":false},
     {"id":"t15b","text":"Clean all bathrooms","done":false},
     {"id":"t15c","text":"Stage living space — simple, clean, spacious","done":false}]'::jsonb),

  (uid, 'thismonth', 'Pack James''s room', 'move', NULL,
   '[{"id":"tj1","text":"Underwear off door","done":false},
     {"id":"tj2","text":"Clear shelf","done":false},
     {"id":"tj3","text":"Break down spaceship","done":false},
     {"id":"tj4","text":"Remove books","done":false},
     {"id":"tj5","text":"Pack large shelf","done":false},
     {"id":"tj6","text":"Clear clothes and toys","done":false}]'::jsonb),

  (uid, 'thismonth', 'Pack Ava''s room', 'move', NULL,
   '[{"id":"ta1","text":"Underwear off door","done":false},
     {"id":"ta2","text":"Organize shelves","done":false},
     {"id":"ta3","text":"Pack ball pit","done":false},
     {"id":"ta4","text":"Pack playhouse","done":false},
     {"id":"ta5","text":"Pack bedside items","done":false},
     {"id":"ta6","text":"Pack closet","done":false}]'::jsonb),

  (uid, 'thismonth', 'Pack hallway + stairs', 'move', NULL,
   '[{"id":"th1","text":"Hallway toy bin","done":false},
     {"id":"th2","text":"Stair pictures","done":false},
     {"id":"th3","text":"Hallway bins","done":false}]'::jsonb),

  (uid, 'thismonth', 'Pack my room', 'move', NULL,
   '[{"id":"tm1","text":"Clothes","done":false},
     {"id":"tm2","text":"Wigs","done":false},
     {"id":"tm3","text":"Bathroom supplies","done":false},
     {"id":"tm4","text":"Books","done":false},
     {"id":"tm5","text":"Furniture decisions","done":false}]'::jsonb),

  (uid, 'thismonth', 'Garage + closet clothing sort', 'move', NULL, '[]'::jsonb),
  (uid, 'thismonth', 'Cancel Airbnb (Code for America)', 'work', 'Before April 1 — urgent', '[]'::jsonb),
  (uid, 'thismonth', 'Code for America — plane + hotel', 'work', NULL, '[]'::jsonb),
  (uid, 'thismonth', 'Briumvi infusion scheduling', 'health', 'Follow up if no call by Mon', '[]'::jsonb),

  (uid, 'thismonth', 'Renters insurance — new place', 'move', 'Set up before move-in',
   '[{"id":"ti1","text":"Contact Liberty Mutual","done":false},
     {"id":"ti2","text":"Get quote for new address","done":false},
     {"id":"ti3","text":"Confirm coverage start date","done":false}]'::jsonb),

  (uid, 'thismonth', 'Set up utilities — new place', 'move', NULL,
   '[{"id":"tu1","text":"Electricity — call or online","done":false},
     {"id":"tu2","text":"Gas if applicable","done":false},
     {"id":"tu3","text":"Internet — compare providers first","done":false},
     {"id":"tu4","text":"Set transfer dates","done":false}]'::jsonb),

  (uid, 'thismonth', 'Close utilities + change of address — current place', 'move', NULL,
   '[{"id":"tc1","text":"Notify current utility providers","done":false},
     {"id":"tc2","text":"USPS mail forwarding","done":false},
     {"id":"tc3","text":"Bank(s)","done":false},
     {"id":"tc4","text":"Coforma / payroll","done":false},
     {"id":"tc5","text":"Kids school","done":false}]'::jsonb),

  (uid, 'thismonth', 'Notify landlord of move-out date', 'move', 'Don''t pay May rent on two places', '[]'::jsonb),
  (uid, 'thismonth', 'Book moving truck', 'move', NULL, '[]'::jsonb),

  -- Later
  (uid, 'later', 'AI music album rollout plan', 'hobby', NULL, '[]'::jsonb),
  (uid, 'later', 'UDP design system concept', 'work', NULL, '[]'::jsonb);

  -- ══════════════════════════════════════════════════════════════════════
  -- ROUTINE CONFIG (default routines from prototype)
  -- ══════════════════════════════════════════════════════════════════════

  INSERT INTO public.routine_config (user_id, morning_base, morning_kids, evening_base, evening_kids)
  VALUES (uid,
    '[{"id":"mb1","group":"In bed","text":"Pray","activeOn":"always","tag":"personal"},
      {"id":"mb2","group":"In bed","text":"Open meditation","activeOn":"always","tag":"personal"},
      {"id":"mb3","group":"In bed","text":"Read devotional","activeOn":"always","tag":"personal"},
      {"id":"mb4","group":"Bathroom","text":"Remove Invisalign","activeOn":"always","tag":"health"},
      {"id":"mb5","group":"Bathroom","text":"Brush teeth","activeOn":"always","tag":"health"},
      {"id":"mb6","group":"Bathroom","text":"Wash face","activeOn":"always","tag":"health"},
      {"id":"mb7","group":"Bathroom","text":"Replace Invisalign","activeOn":"always","tag":"health"},
      {"id":"mb8","group":"Self-care","text":"Eat breakfast","activeOn":"always","tag":"health"},
      {"id":"mb9","group":"Self-care","text":"Take medication","activeOn":"always","tag":"health"},
      {"id":"mb10","group":"Self-care","text":"Vitamin D","activeOn":"always","days":[0],"tag":"health"},
      {"id":"mb11","group":"Self-care","text":"Wash hair","activeOn":["none"],"days":[0],"tag":"health"},
      {"id":"mb12","group":"Self-care","text":"Go for a walk","activeOn":"always","days":[1,2,3,4,5],"tag":"health"}]'::jsonb,
    '[{"id":"mk1","group":"Kids","text":"Wake kids up","activeOn":["morning","all"],"tag":"kids"},
      {"id":"mk2","group":"Kids","text":"Kids breakfast","activeOn":["morning","all"],"tag":"kids"},
      {"id":"mk3","group":"Kids","text":"Pack bags / check backpacks","activeOn":["morning","all"],"tag":"kids"},
      {"id":"mk4","group":"Kids","text":"School drop-off by 8:50am","activeOn":["morning","all"],"schoolOnly":true,"tag":"kids"}]'::jsonb,
    '[{"id":"eb0","group":"Self-care","text":"Eat lunch + dinner today","activeOn":"always","tag":"health"},
      {"id":"eb1","group":"Wind down","text":"Log time in Unanet","activeOn":"always","tag":"work"},
      {"id":"eb2","group":"Wind down","text":"No screens after 10pm","activeOn":"always","tag":"personal"},
      {"id":"eb3","group":"Wind down","text":"Remove Invisalign","activeOn":"always","tag":"health"},
      {"id":"eb4","group":"Wind down","text":"Brush teeth","activeOn":"always","tag":"health"},
      {"id":"eb5","group":"Wind down","text":"Wash face","activeOn":"always","tag":"health"},
      {"id":"eb6","group":"Wind down","text":"Replace Invisalign","activeOn":"always","tag":"health"}]'::jsonb,
    '[{"id":"ek1","group":"Kids","text":"Homework check","activeOn":["morning","evening","all"],"tag":"kids"},
      {"id":"ek7","group":"Kids","text":"School pick-up","activeOn":["morning","all"],"schoolOnly":true,"tag":"kids"},
      {"id":"ek2","group":"Kids","text":"Dinner together","activeOn":["morning","all"],"tag":"kids"},
      {"id":"ek3","group":"Kids","text":"Bath time","activeOn":["all"],"tag":"kids"},
      {"id":"ek4","group":"Kids","text":"Book time","activeOn":["evening","all"],"tag":"kids"},
      {"id":"ek5","group":"Kids","text":"Toothbrushing","activeOn":["evening","all"],"tag":"kids"},
      {"id":"ek6","group":"Kids","text":"Bedtime","activeOn":["evening","all"],"tag":"kids"}]'::jsonb
  )
  ON CONFLICT (user_id) DO UPDATE SET
    morning_base = EXCLUDED.morning_base,
    morning_kids = EXCLUDED.morning_kids,
    evening_base = EXCLUDED.evening_base,
    evening_kids = EXCLUDED.evening_kids;

  RAISE NOTICE 'Seeded % tasks and routine config for user %', 30, uid;
END $$;
