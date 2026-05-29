import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://sclsozlhfaksfcgdggrg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_N7gi3EbRyFFp_azw2HIakg_7qkm1oaT";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);