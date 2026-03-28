import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://udylxepcpdusutgsdcvu.supabase.co'
const supabaseAnonKey = 'sb_publishable_dY3oeGq8jBaJ8cA-a4gnYA_KC2fp0DX'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)