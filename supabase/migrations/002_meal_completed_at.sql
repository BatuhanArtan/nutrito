-- Öğün tamamlanma saati (isteğe bağlı)
ALTER TABLE daily_meals ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE daily_meals ADD COLUMN IF NOT EXISTS completed_at TEXT;
