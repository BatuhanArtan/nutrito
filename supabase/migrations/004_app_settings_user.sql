-- app_settings tablosunu kullanıcı bazlı yap
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Eski unique constraint'i kaldır (sadece key üzerindeydi)
ALTER TABLE app_settings DROP CONSTRAINT IF EXISTS app_settings_key_key;
ALTER TABLE app_settings DROP CONSTRAINT IF EXISTS app_settings_pkey CASCADE;

-- Yeni primary key: (user_id, key) çifti
ALTER TABLE app_settings ADD PRIMARY KEY (user_id, key);

-- RLS politikaları
DROP POLICY IF EXISTS "Allow all access to app_settings" ON app_settings;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_settings_policy" ON app_settings FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Trigger: INSERT'te user_id otomatik set
CREATE TRIGGER set_app_settings_user_id BEFORE INSERT ON app_settings FOR EACH ROW EXECUTE FUNCTION set_user_id();
