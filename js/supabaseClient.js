import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "ここにProject URLを入れる";
const SUPABASE_PUBLISHABLE_KEY = "ここにPublishable keyを入れる";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);