import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhgxwvmnrfbsjiwkuukw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZ3h3dm1ucmZic2ppd2t1dWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTY1MTgsImV4cCI6MjA4MTEzMjUxOH0.Aimkp3uT9Je-r1r2FnSMQ-h2y2dB6Zbu5t988oCmKkU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("--- Checking 'profiles' Columns ---");

    // Attempt to insert a dummy to get column info from error or select
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
        console.log("Error:", error.message);
    } else {
        if (data.length > 0) {
            console.log("Columns:", Object.keys(data[0]).join(', '));
        } else {
            // Table empty, try to insert dummy to see constraints/columns
            console.log("Table empty. Forcing error to reveal columns...");
            const { error: insErr } = await supabase.from('profiles').insert({ invalid_col: 'test' });
            if (insErr) console.log("Insert Error:", insErr.message);
        }
    }
}

checkSchema();
