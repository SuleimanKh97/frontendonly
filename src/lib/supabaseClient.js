import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fepunrzkrfyuuibpenov.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcHVucnprcmZ5dXVpYnBlbm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDUyOTksImV4cCI6MjA3MzA4MTI5OX0.TiTn8Q5nUHe0te5ASFq-MHvvmbHlOP_qggsO53KHxns'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
