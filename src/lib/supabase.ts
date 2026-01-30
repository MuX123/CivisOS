import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hsyfpgorvclypzgmkhv2.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeWZwZ29ydmNseXB6Z21raHYyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjU0MTcsImV4cCI6MjA4NTMwMTQxN30.DIvF1plerlPxxKFYdZ5NTdey8wk7IjecaXX9NXAn6jkg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)