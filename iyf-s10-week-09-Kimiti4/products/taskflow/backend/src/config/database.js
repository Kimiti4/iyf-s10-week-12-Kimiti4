require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: SUPABASE_URL and SUPABASE_KEY are not set. Database operations will fail.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = supabase;
