-- Özel (custom) ara öğün desteği
ALTER TABLE daily_meals ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false;
ALTER TABLE daily_meals ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE daily_meals ADD COLUMN IF NOT EXISTS sort_order REAL;
