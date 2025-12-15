import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhgxwvmnrfbsjiwkuukw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZ3h3dm1ucmZic2ppd2t1dWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTY1MTgsImV4cCI6MjA4MTEzMjUxOH0.Aimkp3uT9Je-r1r2FnSMQ-h2y2dB6Zbu5t988oCmKkU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    console.log("Checking 'profiles' table...");

    // 1. Check if table exists by selecting
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Profile Check Failed:", error.message);
    } else {
        console.log("Profiles Table OK. Rows found:", data.length);
    }
}

checkProfiles();
