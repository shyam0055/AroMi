// ═══════════════════════════════════════════════
//   AroMi — Supabase Config (shared across all pages)
//   Import this script in every HTML page via:
//   <script src="supabase.js"></script>
// ═══════════════════════════════════════════════

const SUPABASE_URL  = "https://xyvlcjjyicbsabnzbrjz.supabase.co";
const SUPABASE_ANON = "sb_publishable_UpTAfUE-fDOtETai6Ee6Ow_hYnQB5xh";

// Initialize Supabase client (requires @supabase/supabase-js CDN loaded before this)
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ── AUTH HELPERS ─────────────────────────────────

/** Sign up a new user with email & password */
async function aromi_signUp(email, password, profileData = {}) {
  const { data, error } = await _supabase.auth.signUp({ email, password });
  if (error) return { error };

  // Insert profile row after signup
  if (data.user) {
    const { error: profileError } = await _supabase.from('profiles').insert({
      id:         data.user.id,
      email:      email,
      full_name:  profileData.full_name  || null,
      age:        profileData.age        || null,
      gender:     profileData.gender     || null,
      height_cm:  profileData.height_cm  || null,
      weight_kg:  profileData.weight_kg  || null,
      created_at: new Date().toISOString()
    });
    if (profileError) console.warn("Profile insert error:", profileError.message);
  }

  return { data };
}

/** Log in existing user */
async function aromi_signIn(email, password) {
  const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

/** Log out */
async function aromi_signOut() {
  await _supabase.auth.signOut();
  window.location.href = "index.html";
}

/** Get current logged-in user (returns null if not logged in) */
async function aromi_getUser() {
  const { data: { user } } = await _supabase.auth.getUser();
  return user;
}

/** Redirect to login if not authenticated */
async function aromi_requireAuth(redirectTo = "login.html") {
  const user = await aromi_getUser();
  if (!user) window.location.href = redirectTo;
  return user;
}

// ── PROFILE HELPERS ──────────────────────────────

/** Get user profile */
async function aromi_getProfile(userId) {
  const { data, error } = await _supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

/** Update user profile */
async function aromi_updateProfile(userId, updates) {
  const { data, error } = await _supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
  return { data, error };
}

// ── PREDICTION HELPERS ───────────────────────────

/** Save a prediction result */
async function aromi_savePrediction(userId, predictionData) {
  const { data, error } = await _supabase.from('predictions').insert({
    user_id:           userId,
    age:               predictionData.age               || null,
    gender:            predictionData.gender            || null,
    symptoms:          predictionData.symptoms          || null,
    body_part:         predictionData.body_part         || null,
    existing_conditions: predictionData.existing_conditions || null,
    lifestyle_info:    predictionData.lifestyle_info    || null,
    result_summary:    predictionData.result_summary    || null,
    risk_level:        predictionData.risk_level        || null,
    created_at:        new Date().toISOString()
  });
  return { data, error };
}

/** Get all predictions for a user */
async function aromi_getPredictions(userId) {
  const { data, error } = await _supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

// ── TOPIC VIEW HELPERS ───────────────────────────

/** Log that a user viewed a health topic */
async function aromi_logTopicView(userId, topicKey, topicName) {
  // Upsert: update view count if already viewed, else insert
  const { data: existing } = await _supabase
    .from('topic_views')
    .select('id, view_count')
    .eq('user_id', userId)
    .eq('topic_key', topicKey)
    .single();

  if (existing) {
    await _supabase
      .from('topic_views')
      .update({
        view_count:  existing.view_count + 1,
        last_viewed: new Date().toISOString()
      })
      .eq('id', existing.id);
  } else {
    await _supabase.from('topic_views').insert({
      user_id:     userId,
      topic_key:   topicKey,
      topic_name:  topicName,
      view_count:  1,
      last_viewed: new Date().toISOString()
    });
  }
}

/** Get all topics a user has viewed */
async function aromi_getTopicViews(userId) {
  const { data, error } = await _supabase
    .from('topic_views')
    .select('*')
    .eq('user_id', userId)
    .order('last_viewed', { ascending: false });
  return { data, error };
}