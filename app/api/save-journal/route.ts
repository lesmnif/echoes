import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { identity, entry, entryDate, title } = await request.json();
    
    console.log("📝 Saving journal data...");
    console.log("Identity length:", identity?.length || 0);
    console.log("Entry length:", entry?.length || 0);
    console.log("Entry date:", entryDate);
    console.log("Entry title:", title);

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // For now, use default user ID (no auth)
    const defaultUserId = "00000000-0000-0000-0000-000000000000";
    
    // Save identity (upsert)
    const { error: identityError } = await supabase
      .from('user_identity')
      .upsert({
        user_id: defaultUserId,
        identity_text: identity
      });

    if (identityError) {
      console.error("❌ Identity save error:", identityError);
      throw identityError;
    }

    // Save journal entry for the specified date (upsert)
    const targetDate = entryDate || new Date().toISOString().split('T')[0];
    const plainTextContent = entry.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = plainTextContent.split(/\s+/).filter(Boolean).length;

    const { error: journalError } = await supabase
      .from('journal_entries')
      .upsert({
        user_id: defaultUserId,
        entry_date: targetDate,
        title: title || 'Daily Journal',
        content: entry,
        word_count: wordCount,
        last_edited_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,entry_date'
      });

    if (journalError) {
      console.error("❌ Journal save error:", journalError);
      throw journalError;
    }

    console.log(`✅ Data saved successfully for date: ${targetDate}`);
    return Response.json({ success: true, savedDate: targetDate });

  } catch (error) {
    console.error("❌ Error in save-journal API:", error);
    return Response.json(
      { error: "Failed to save journal data" },
      { status: 500 }
    );
  }
}