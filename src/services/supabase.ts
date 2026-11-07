import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vtpryqwnccaeeuzxunvz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Z99XkqOmtMDvcObUOt9Qtw_E7BoQCcp';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
