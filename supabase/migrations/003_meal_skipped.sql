-- Öğün "Atlandı" durumu
ALTER TABLE daily_meals ADD COLUMN IF NOT EXISTS skipped BOOLEAN DEFAULT false;
