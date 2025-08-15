import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    console.log("📖 Fetching all journal entries...");

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // For now, use default user ID (no auth)
    const defaultUserId = "00000000-0000-0000-0000-000000000000";
    
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', defaultUserId)
      .order('entry_date', { ascending: false });

    if (error) {
      console.error("❌ Error fetching journal entries:", error);
      throw error;
    }

    console.log(`✅ Found ${entries?.length || 0} journal entries`);
    return Response.json({ entries: entries || [] });

  } catch (error) {
    console.error("❌ Error in journal-entries API:", error);
    return Response.json(
      { error: "Failed to fetch journal entries" },
      { status: 500 }
    );
  }
} 