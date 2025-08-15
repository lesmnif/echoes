import Link from "next/link";
import JournalEditor from "@/components/JournalEditor";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";


export default async function JournalPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Load data from database (just like the docs example)
  const defaultUserId = "00000000-0000-0000-0000-000000000000";

  // Load identity
  const { data: identity } = await supabase
    .from("user_identity")
    .select("identity_text")
    .eq("user_id", defaultUserId)
    .single();

  // Load today's journal entry for fast initial load
  const today = new Date().toISOString().split("T")[0];
  const { data: todayEntry } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", defaultUserId)
    .eq("entry_date", today)
    .single();

  console.log("Server-side data loaded:", { identity, todayEntry });

  return (
    <div className="min-h-dvh p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-3 text-sm"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>

          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Your Personal Journal
          </h1>
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mt-1">
            Help the AI understand who you are and what you care about to create
            posts that sound like you.
          </p>
          <div className="mt-4 h-px bg-zinc-200/60 dark:bg-zinc-700/60" />
        </div>

        <JournalEditor
          initialIdentity={identity?.identity_text || ""}
          initialEntry={todayEntry?.content || ""}
          todayEntry={todayEntry}
        />
      </div>
    </div>
  );
}
