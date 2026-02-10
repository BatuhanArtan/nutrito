-- Nutrito Database Schema
-- Run this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Units (bardak, yk, tk, çk, kase, adet, avuç, gram)
CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foods (Besinler)
CREATE TABLE IF NOT EXISTS foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  default_unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food Exchanges (Değişimler - sol birim+miktar = sağ birim+miktar, tersinir)
CREATE TABLE IF NOT EXISTS food_exchanges (
  id TEXT PRIMARY KEY,
  food_id TEXT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  quantity_left DECIMAL DEFAULT 1 NOT NULL,
  left_unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
  equivalent_food_id TEXT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  quantity DECIMAL NOT NULL,
  unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mevcut tabloya yeni kolonlar eklemek için (zaten varsa atla):
-- ALTER TABLE food_exchanges ADD COLUMN IF NOT EXISTS quantity_left DECIMAL DEFAULT 1;
-- ALTER TABLE food_exchanges ADD COLUMN IF NOT EXISTS left_unit_id TEXT REFERENCES units(id) ON DELETE SET NULL;

-- Recipe Categories (Tarif kategorileri)
CREATE TABLE IF NOT EXISTS recipe_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#e07a5f',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes (Tarifler)
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category_id TEXT REFERENCES recipe_categories(id) ON DELETE SET NULL,
  ingredients TEXT,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Meals (Günlük öğünler)
CREATE TABLE IF NOT EXISTS daily_meals (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack', 'dinner')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, meal_type)
);

-- Meal Items (Öğündeki besinler)
CREATE TABLE IF NOT EXISTS meal_items (
  id TEXT PRIMARY KEY,
  daily_meal_id TEXT NOT NULL REFERENCES daily_meals(id) ON DELETE CASCADE,
  food_id TEXT REFERENCES foods(id) ON DELETE CASCADE,
  recipe_id TEXT REFERENCES recipes(id) ON DELETE CASCADE,
  quantity DECIMAL NOT NULL,
  unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water Logs (Su takibi)
CREATE TABLE IF NOT EXISTS water_logs (
  id TEXT PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  glasses INTEGER DEFAULT 0,
  target INTEGER DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weight Logs (Kilo takibi)
CREATE TABLE IF NOT EXISTS weight_logs (
  id TEXT PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  weight DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title);
CREATE INDEX IF NOT EXISTS idx_daily_meals_date ON daily_meals(date);
CREATE INDEX IF NOT EXISTS idx_meal_items_meal ON meal_items(daily_meal_id);
CREATE INDEX IF NOT EXISTS idx_water_logs_date ON water_logs(date);
CREATE INDEX IF NOT EXISTS idx_weight_logs_date ON weight_logs(date);
CREATE INDEX IF NOT EXISTS idx_food_exchanges_food ON food_exchanges(food_id);

-- Enable Row Level Security (RLS) - Optional, for single user it's not strictly necessary
-- But good practice to have it enabled

ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

-- Allow public access (since we don't have auth)
-- For a single-user app, this is acceptable

CREATE POLICY "Allow all access to units" ON units FOR ALL USING (true);
CREATE POLICY "Allow all access to foods" ON foods FOR ALL USING (true);
CREATE POLICY "Allow all access to food_exchanges" ON food_exchanges FOR ALL USING (true);
CREATE POLICY "Allow all access to recipe_categories" ON recipe_categories FOR ALL USING (true);
CREATE POLICY "Allow all access to recipes" ON recipes FOR ALL USING (true);
CREATE POLICY "Allow all access to daily_meals" ON daily_meals FOR ALL USING (true);
CREATE POLICY "Allow all access to meal_items" ON meal_items FOR ALL USING (true);
CREATE POLICY "Allow all access to water_logs" ON water_logs FOR ALL USING (true);
CREATE POLICY "Allow all access to weight_logs" ON weight_logs FOR ALL USING (true);

-- Insert default units
INSERT INTO units (id, name, abbreviation) VALUES
  ('unit_bardak', 'Bardak', 'brd'),
  ('unit_yk', 'Yemek Kaşığı', 'yk'),
  ('unit_tk', 'Tatlı Kaşığı', 'tk'),
  ('unit_ck', 'Çay Kaşığı', 'çk'),
  ('unit_kase', 'Kase', 'kase'),
  ('unit_adet', 'Adet', 'adet'),
  ('unit_avuc', 'Avuç', 'avuç'),
  ('unit_gram', 'Gram', 'g'),
  ('unit_dilim', 'Dilim', 'dilim'),
  ('unit_porsiyon', 'Porsiyon', 'prs')
ON CONFLICT (id) DO NOTHING;

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE units;
ALTER PUBLICATION supabase_realtime ADD TABLE foods;
ALTER PUBLICATION supabase_realtime ADD TABLE food_exchanges;
ALTER PUBLICATION supabase_realtime ADD TABLE recipe_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_meals;
ALTER PUBLICATION supabase_realtime ADD TABLE meal_items;
ALTER PUBLICATION supabase_realtime ADD TABLE water_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE weight_logs;
