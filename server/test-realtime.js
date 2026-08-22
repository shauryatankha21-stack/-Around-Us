require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
console.log('Connecting...');
supabase.channel('test').on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, () => console.log('Ping')).subscribe((s) => console.log('Status:', s));
setTimeout(() => process.exit(0), 5000);
