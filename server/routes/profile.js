const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasConfig =
  supabaseUrl &&
  !supabaseUrl.includes('YOUR_') &&
  supabaseServiceKey &&
  !supabaseServiceKey.includes('YOUR_');

const supabaseAdmin = hasConfig
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

function getUserClient(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !hasConfig) return null;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: { Authorization: authHeader },
    },
  });
}

// GET /api/profile — Get current user's profile
router.get('/', async (req, res) => {
  const userClient = getUserClient(req);
  if (!userClient) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('name, college, city, date_of_birth, gender')
    .eq('id', user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || { name: user.email?.split('@')[0] || 'User' });
});

// PUT /api/profile — Update current user's profile
router.put('/', async (req, res) => {
  const userClient = getUserClient(req);
  if (!userClient) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { name, college, city, date_of_birth, gender } = req.body;
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      name: name?.trim() || '',
      college: college?.trim() || null,
      city: city?.trim() || null,
      date_of_birth: date_of_birth || null,
      gender: gender || 'Any',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
