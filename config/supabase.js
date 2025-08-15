// config/supabase.js
const { createClient } = require("@supabase/supabase-js");
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_ANON_KEY,
} = require("./env");

const url = SUPABASE_URL;
const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("Supabase URL/KEY are not set");
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

module.exports = supabase;
