import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://tfsvfipsijtrzovbmmeq.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_hoWB8_J0gPo_DcAAPy14iw_MS87t1Sk";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas no ambiente.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
