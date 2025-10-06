import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Configurações do Supabase
const supabaseUrl = "https://zoundikpriefrewhmqgf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdW5kaWtwcmllZnJld2htcWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwODEyNTAsImV4cCI6MjA3MjY1NzI1MH0.fQRHBjGlGcFTou5ueDAZ-j61cVekidtz1sYK-3QLNwk";

// Criar cliente Supabase
const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

export default supabase;
