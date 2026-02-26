-- Master hesabın verilerini döndüren SECURITY DEFINER fonksiyon
-- Bu fonksiyon RLS'yi bypass ederek sadece master hesabın verilerini okur.
-- Herhangi bir authenticated kullanıcı çağırabilir, ancak master hesap çağıramaz.
CREATE OR REPLACE FUNCTION get_master_data()
RETURNS jsonb AS $$
DECLARE
  master_id UUID := 'f201c860-0ec2-4e7a-be2a-1e59e511f121';
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN jsonb_build_object(
    'foods',     COALESCE((SELECT jsonb_agg(row_to_json(f)) FROM foods f WHERE f.user_id = master_id), '[]'::jsonb),
    'exchanges', COALESCE((SELECT jsonb_agg(row_to_json(e)) FROM food_exchanges e WHERE e.user_id = master_id), '[]'::jsonb),
    'recipes',   COALESCE((SELECT jsonb_agg(row_to_json(r)) FROM recipes r WHERE r.user_id = master_id), '[]'::jsonb),
    'categories',COALESCE((SELECT jsonb_agg(row_to_json(c)) FROM recipe_categories c WHERE c.user_id = master_id), '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
