import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export { supabase };