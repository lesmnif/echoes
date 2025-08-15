"use client";
import { useState, useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import AIMotivationalPost from "./AIMotivationalPost";

interface JournalData {
  whoIAm: string;
}

interface JournalEntry {
  id: string;
  user_id: string;
  entry_date: string;
  title: string | null;
  content: string | null;
  word_count: number | null;
  created_at: string | null;
  updated_at: string | null;
  last_edited_at: string | null;
}

interface JournalEditorProps {
  initialIdentity: string;
  initialEntry: string;
  todayEntry: JournalEntry | null;
}

export default function JournalEditor({
  initialIdentity,
  initialEntry,
  todayEntry,
}: JournalEditorProps) {
  // Initialize with server-loaded data or fallback defaults
  const [journalData, setJournalData] = useState<JournalData>({
    whoIAm: initialIdentity,
  });

  // Initialize with server-loaded data or fallback default
  const [entry, setEntry] = useState<string>(initialEntry);

  // Debug: Log initial entry
  console.log("Initial entry:", initialEntry);
  console.log("Today entry prop:", todayEntry);
  const [wordCount, setWordCount] = useState(0);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("");
  const [, setToolbarTick] = useState(0);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [entryTitle, setEntryTitle] = useState(
    todayEntry?.title || "Daily Journal"
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [isMobileBarVisible, setIsMobileBarVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dayEntries, setDayEntries] = useState<{ [date: string]: string }>({});
  const [allJournalEntries, setAllJournalEntries] = useState<JournalEntry[]>(
    []
  );
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  // Get day label for journal-style display
  const getDateLabel = (date: string) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (date === today) return "Today";
    if (date === yesterdayStr) return "Yesterday";

    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  // Get available dates for navigation (entries + today)
  const getAvailableDates = () => {
    const today = new Date().toISOString().split("T")[0];
    const entryDates = allJournalEntries.map((entry) => entry.entry_date);

    // Include today and all entry dates, remove duplicates
    const availableDates = [...new Set([...entryDates, today])].sort();
    return availableDates;
  };

  // Check if we can go to previous day
  const canGoPrevious = () => {
    const availableDates = getAvailableDates();
    const currentIndex = availableDates.indexOf(currentDate);
    return currentIndex > 0; // Can go back if not the first date
  };

  // Check if we can go to next day
  const canGoNext = () => {
    const availableDates = getAvailableDates();
    const currentIndex = availableDates.indexOf(currentDate);
    return currentIndex < availableDates.length - 1; // Can go forward if not the last date
  };

  // Fetch all journal entries in the background
  const fetchAllEntries = async () => {
    try {
      setIsLoadingEntries(true);
      const response = await fetch("/api/journal-entries");

      if (!response.ok) {
        throw new Error("Failed to fetch entries");
      }

      const data = await response.json();
      console.log("data", data, data.entries);
      setAllJournalEntries(data.entries || []);

      // Populate dayEntries with the loaded data
      const entriesMap: { [date: string]: string } = {};
      data.entries?.forEach((entry: JournalEntry) => {
        entriesMap[entry.entry_date] = entry.content || "";
      });
      console.log("entriesMap", entriesMap);
      setDayEntries(entriesMap);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  // Switch to a different day, saving current content first
  const switchToDay = (newDate: string) => {
    console.log("switchToDay called with date:", newDate);
    console.log("current entry before switch:", entry);

    // Save current day's content to local state
    setDayEntries((prev) => ({ ...prev, [currentDate]: entry }));

    // Switch to new day
    setCurrentDate(newDate);

    // Find the entry for this date from loaded data
    const entryForDate = allJournalEntries.find(
      (entry) => entry.entry_date === newDate
    );

    console.log("entryForDate found:", entryForDate);
    console.log("allJournalEntries:", allJournalEntries);

    if (entryForDate) {
      // Use the actual database content for this date
      console.log("Setting entry to:", entryForDate.content);
      setEntry(entryForDate.content || "");
      setWordCount(entryForDate.word_count || 0);
      setEntryTitle(entryForDate.title || "Daily Journal");
    } else {
      // No entry exists for this date, start with empty content
      console.log("No entry found for date, setting empty content");
      setEntry("");
      setWordCount(0);
      setEntryTitle("Daily Journal");
    }
  };

  // Navigate to previous available date
  const goToPreviousDay = () => {
    const availableDates = getAvailableDates();
    const currentIndex = availableDates.indexOf(currentDate);
    if (currentIndex > 0) {
      const previousDate = availableDates[currentIndex - 1];
      switchToDay(previousDate);
    }
  };

  // Navigate to next available date
  const goToNextDay = () => {
    const availableDates = getAvailableDates();
    const currentIndex = availableDates.indexOf(currentDate);
    if (currentIndex < availableDates.length - 1) {
      const nextDate = availableDates[currentIndex + 1];
      switchToDay(nextDate);
    }
  };

  // Save current entry to database
  const saveToDatabase = async () => {
    try {
      setIsSaving(true);
      setSaveStatus(`Saving entry for ${getDateLabel(currentDate)}...`);

      const response = await fetch("/api/save-journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identity: journalData.whoIAm,
          entry: entry,
          entryDate: currentDate,
          title: entryTitle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      // Update local state with the saved entry
      const now = new Date().toISOString();

      // Update allJournalEntries to include the new/updated entry
      setAllJournalEntries((prev) => {
        const existingIndex = prev.findIndex(
          (e) => e.entry_date === currentDate
        );

        if (existingIndex >= 0) {
          // Update existing entry - preserve created_at, update others
          const existingEntry = prev[existingIndex];
          const updated = [...prev];
          updated[existingIndex] = {
            ...existingEntry,
            title: entryTitle,
            content: entry,
            word_count: wordCount,
            updated_at: now,
            last_edited_at: now,
            // Keep the original created_at
          };
          return updated;
        } else {
          // Add new entry - all timestamps are current
          const newEntry = {
            id: "", // Will be generated by database
            user_id: "00000000-0000-0000-0000-000000000000", // Default user ID
            entry_date: currentDate,
            title: entryTitle,
            content: entry,
            word_count: wordCount,
            created_at: now,
            updated_at: now,
            last_edited_at: now,
          };
          return [...prev, newEntry];
        }
      });

      setSaveStatus(`Saved successfully for ${getDateLabel(currentDate)}!`);
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Error saving:", error);
      setSaveStatus("Error saving data");
      setTimeout(() => setSaveStatus(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Editor setup

  // Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Placeholder.configure({
        placeholder: "Start your entry…",
      }),
    ],
    content: entry,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      setEntry(content);
      setWordCount(
        editor.state.doc.textContent.trim().split(/\s+/).filter(Boolean).length
      );
      setLastUpdatedAt(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    },
    editorProps: {
      attributes: {
        class:
          "w-full min-h-[60vh] text-zinc-900 dark:text-zinc-100 font-sans text-[15px] leading-relaxed text-left [&_h1]:text-left [&_h2]:text-left [&_p]:text-left [&_blockquote]:text-left [&_li]:text-left [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-0 [&_h2]:mb-2 [&_p]:leading-[1.7] [&_p]:text-zinc-700 [&_p]:dark:text-zinc-300 [&_em]:text-zinc-700 dark:[&_em]:text-zinc-300 [&_em]:font-medium [&_strong]:text-zinc-900 [&_strong]:dark:text-zinc-100 [&_u]:decoration-2 [&_u]:underline-offset-2 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-6 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-200 dark:[&_blockquote]:border-zinc-700 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-700 dark:[&_blockquote]:text-zinc-300 px-2 sm:px-6 py-3 sm:py-8 focus:outline-none",
      },
    },
  });

  // Force toolbar to reflect selection/mark changes immediately
  useEffect(() => {
    if (!editor) return;
    const force = () => setToolbarTick((t) => t + 1);
    editor.on("selectionUpdate", force);
    editor.on("transaction", force);
    editor.on("focus", force);
    editor.on("blur", force);
    return () => {
      editor.off("selectionUpdate", force);
      editor.off("transaction", force);
      editor.off("focus", force);
      editor.off("blur", force);
    };
  }, [editor]);

  useEffect(() => {
    if (editor) {
      setWordCount(
        editor.state.doc.textContent.trim().split(/\s+/).filter(Boolean).length
      );
    }
  }, [editor]);

  // Update editor content when entry changes
  useEffect(() => {
    if (editor && entry !== editor.getHTML()) {
      console.log("Updating editor content to:", entry);
      editor.commands.setContent(entry);
    }
  }, [entry, editor]);

  const identitySummary = useMemo(() => {
    const text = journalData.whoIAm.replace(/\s+/g, " ").trim();
    return text.length > 180 ? `${text.slice(0, 180)}…` : text;
  }, [journalData.whoIAm]);

  const [todayLabel, setTodayLabel] = useState<string>("");

  // Set date label on client side to avoid hydration mismatch
  useEffect(() => {
    setTodayLabel(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    );
  }, []);

  // Fetch all journal entries in the background after component mounts
  useEffect(() => {
    fetchAllEntries();
  }, []); // Only run on mount

  const htmlToMarkdown = (html: string | null): string => {
    if (!html) return "";
    let md = html;
    md = md.replace(
      /<h2[^>]*>\s*<strong>(.*?)<\/strong>\s*<\/h2>/gi,
      "## $1\n"
    );
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n");
    md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
    md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
    md = md.replace(/<u>(.*?)<\/u>/gi, "$1");
    md = md.replace(/<br\s*\/?>(\s*)/gi, "\n");
    md = md.replace(/<p[^>]*>/gi, "");
    md = md.replace(/<\/p>/gi, "\n\n");
    md = md.replace(/<[^>]+>/g, "");
    md = md
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");
    return md.trim();
  };

  const download = (filename: string, text: string, type: string) => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadText = () => {
    const dateLabel =
      todayLabel ||
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    const plain = `Journal — ${dateLabel}\n\n${htmlToMarkdown(entry)}\n`;
    download(
      `journal-${new Date().toISOString().slice(0, 10)}.txt`,
      plain,
      "text/plain"
    );
  };

  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    editor?.isActive(name as any, attrs) ?? false;

  return (
    <div
      className={`space-y-4 sm:space-y-6 ${
        isFocusMode ? "max-w-3xl mx-auto" : ""
      } px-2 sm:px-0 ${
        !isFocusMode && isMobileBarVisible ? "pb-24 sm:pb-0" : "pb-16 sm:pb-0"
      }`}
    >
      {/* Top controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => setIsFocusMode((v) => !v)}
            className="px-3 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700"
            title="Toggle focus mode"
          >
            {isFocusMode ? "Exit Focus" : "Focus Mode"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveToDatabase}
            disabled={isSaving}
            className="px-3 py-1.5 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isSaving ? "Saving..." : "Save to Database"}
          </button>
          {saveStatus && (
            <span
              className={`text-xs ${
                saveStatus.includes("Error")
                  ? "text-red-600"
                  : saveStatus.includes("success")
                  ? "text-green-600"
                  : "text-blue-600"
              }`}
            >
              {saveStatus}
            </span>
          )}

          <button
            onClick={handleDownloadText}
            className="px-2 py-1.5 text-xs rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 whitespace-nowrap"
          >
            Download notes
          </button>
        </div>
      </div>

      {/* Identity compact card (hidden in focus mode) */}
      {!isFocusMode && (
        <section className="rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-zinc-200/70 dark:border-zinc-700/70 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm shadow-[0_1px_0_0_rgba(0,0,0,0.02)] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] transition-shadow">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <div className="text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-400 uppercase mb-2">
                Identity
              </div>
              {!isEditingIdentity ? (
                <>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {identitySummary}
                  </p>
                  {lastUpdatedAt && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                      Last updated: {lastUpdatedAt}
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <label htmlFor="whoIAm" className="sr-only">
                    Who I Am
                  </label>
                  <textarea
                    id="whoIAm"
                    value={journalData.whoIAm}
                    onChange={(e) =>
                      setJournalData((p) => ({ ...p, whoIAm: e.target.value }))
                    }
                    className="w-full h-40 px-3 py-2 border border-zinc-200/70 dark:border-zinc-700/70 rounded-lg bg-white/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingIdentity(false)}
                      className="px-3 py-1.5 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => setIsEditingIdentity(false)}
                      className="px-3 py-1.5 rounded-md bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            {!isEditingIdentity && (
              <button
                onClick={() => setIsEditingIdentity(true)}
                className="text-xs px-3 py-1.5 rounded-md bg-zinc-100/80 hover:bg-zinc-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/70 dark:border-zinc-700/70 whitespace-nowrap self-start sm:self-auto"
              >
                Edit
              </button>
            )}
          </div>
        </section>
      )}

      {/* Editor header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        {!isFocusMode ? (
          <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
            Press ⌘B / ⌘I / ⌘U to format, or use the Format menu
          </span>
        ) : (
          <span />
        )}
      </div>

      {/* Editor card (clean, stoic) */}
      <section>
        <div className="rounded-xl sm:rounded-2xl p-0 border border-zinc-200/70 dark:border-zinc-700/70 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm shadow-[0_1px_0_0_rgba(0,0,0,0.02)] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] transition-shadow relative">
          <div className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-2xl">
                {isEditingTitle ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={entryTitle}
                      onChange={(e) => setEntryTitle(e.target.value)}
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setIsEditingTitle(false);
                        }
                      }}
                      placeholder="Enter a title for your entry..."
                      className="w-full text-2xl font-serif font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 bg-transparent border-none outline-none focus:ring-0 p-0 text-center"
                      autoFocus
                    />
                  </div>
                ) : (
                  <h1
                    onClick={() => setIsEditingTitle(true)}
                    className={`font-serif text-2xl font-semibold tracking-tight cursor-pointer transition-colors text-center ${
                      entryTitle
                        ? "text-zinc-900 dark:text-zinc-100 hover:text-zinc-700 dark:hover:text-zinc-300"
                        : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400"
                    }`}
                    title="Click to edit title"
                  >
                    {entryTitle || "Daily Journal"}
                  </h1>
                )}

                {/* Journal date - clean navigation layout */}
                <div className="mt-4 mb-4">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={goToPreviousDay}
                      disabled={!canGoPrevious()}
                      className={`transition-colors p-1 w-6 h-6 flex items-center justify-center ${
                        canGoPrevious()
                          ? "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                          : "text-transparent pointer-events-none"
                      }`}
                      title="Previous day"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M10 12L6 8L10 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    <div className="flex flex-col items-center mx-3 h-12 justify-center">
                      <div className="font-serif text-zinc-600 dark:text-zinc-400 text-lg italic tracking-tight text-center w-48">
                        {getDateLabel(currentDate)}
                      </div>

                      {/* Show full date only for "Today" and "Yesterday" to avoid duplication */}
                      {["Today", "Yesterday"].includes(
                        getDateLabel(currentDate)
                      ) && (
                        <div className="text-zinc-400 dark:text-zinc-500 text-xs font-mono mt-1">
                          {new Date(currentDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={goToNextDay}
                      disabled={!canGoNext()}
                      className={`transition-colors p-1 w-6 h-6 flex items-center justify-center ${
                        canGoNext()
                          ? "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                          : "text-transparent pointer-events-none"
                      }`}
                      title={canGoNext() ? "Next day" : ""}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M6 4L10 8L6 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {!isFocusMode && (
                    <div className="flex justify-center mt-3">
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center">
                        Write with honesty. Keep it raw and unfiltered.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Toolbar toggle - positioned absolutely to not affect centering */}
            {!isFocusMode && editor && (
              <button
                onClick={() => setIsToolbarVisible(!isToolbarVisible)}
                className="hidden sm:block absolute top-3 right-3 sm:top-6 sm:right-6 px-3 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70 transition-all duration-200 whitespace-nowrap"
                title={
                  isToolbarVisible
                    ? "Hide formatting toolbar"
                    : "Show formatting toolbar"
                }
              >
                <span className="transition-all duration-200">
                  {isToolbarVisible ? "Hide Toolbar" : "Show Toolbar"}
                </span>
              </button>
            )}
          </div>
          <div className="border-t border-zinc-200/60 dark:border-zinc-700/60" />

          {/* Persistent formatting toolbar */}
          {!isFocusMode && editor && (
            <div
              className={`hidden sm:block bg-zinc-50/80 dark:bg-zinc-800/50 border-b border-zinc-200/60 dark:border-zinc-700/60 px-3 sm:px-4 transition-all duration-300 ease-in-out overflow-hidden ${
                isToolbarVisible
                  ? "py-2 sm:py-3 max-h-32 sm:max-h-20 opacity-100"
                  : "py-0 max-h-0 opacity-0"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto sm:overflow-visible flex-nowrap">
                {/* Basic formatting */}
                <div className="inline-flex items-center gap-1 flex-shrink-0">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleBold().run();
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-md font-semibold whitespace-nowrap ${
                      isActive("bold")
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-600"
                    }`}
                    title="Bold (⌘B)"
                  >
                    <span className="font-bold">B</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleItalic().run();
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-md font-semibold whitespace-nowrap ${
                      isActive("italic")
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-600"
                    }`}
                    title="Italic (⌘I)"
                  >
                    <span className="italic">I</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleUnderline().run();
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-md font-semibold whitespace-nowrap ${
                      isActive("underline")
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-600"
                    }`}
                    title="Underline (⌘U)"
                  >
                    <span className="underline underline-offset-2 decoration-2">
                      U
                    </span>
                  </button>
                </div>

                {/* Divider - hidden on mobile to save space */}
                <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-600 hidden sm:block" />

                {/* Structure formatting */}
                <div className="inline-flex items-center gap-1 flex-shrink-0">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleHeading({ level: 2 }).run();
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-md whitespace-nowrap ${
                      isActive("heading", { level: 2 })
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-600"
                    }`}
                    title="Section (H2)"
                  >
                    <span>H2</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleBlockquote().run();
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-md whitespace-nowrap ${
                      isActive("blockquote")
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-600"
                    }`}
                    title="Quote"
                  >
                    <span className="w-5 inline-block text-center">❝</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleBulletList().run();
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-md whitespace-nowrap ${
                      isActive("bulletList")
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-600"
                    }`}
                    title="Bulleted List"
                  >
                    <span className="w-5 inline-block text-center">•</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleOrderedList().run();
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-md whitespace-nowrap ${
                      isActive("orderedList")
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-600"
                    }`}
                    title="Numbered List"
                  >
                    <span className="w-5 inline-block text-center">1.</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().setHorizontalRule().run();
                    }}
                    className="px-2.5 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-600 whitespace-nowrap"
                    title="Divider"
                  >
                    <span className="w-5 inline-block text-center">—</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().undo().run();
                    }}
                    className="px-2.5 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-600 whitespace-nowrap"
                    title="Undo (⌘Z)"
                  >
                    <span className="w-5 inline-block text-center">↶</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().redo().run();
                    }}
                    className="px-2.5 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-600 whitespace-nowrap"
                    title="Redo (⇧⌘Z)"
                  >
                    <span className="w-5 inline-block text-center">↷</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <EditorContent
            editor={editor}
            className="w-full min-h-[60vh] text-zinc-900 dark:text-zinc-100 font-sans text-[15px] leading-relaxed text-left [&_h1]:text-left [&_h2]:text-left [&_p]:text-left [&_blockquote]:text-left [&_li]:text-left [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-0 [&_h2]:mb-2 [&_p]:leading-[1.7] [&_p]:text-zinc-700 [&_p]:dark:text-zinc-300 [&_em]:text-zinc-700 dark:[&_em]:text-zinc-300 [&_em]:font-medium [&_strong]:text-zinc-900 [&_strong]:dark:text-zinc-100 [&_u]:decoration-2 [&_u]:underline-offset-2 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-6 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-200 dark:[&_blockquote]:border-zinc-700 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-700 dark:[&_blockquote]:text-zinc-300 px-3 sm:px-6 py-4 sm:py-8 focus:outline-none"
          />
        </div>

        {/* Status bar (hidden in focus mode) */}
        {!isFocusMode && (
          <div className="mt-3 flex items-center justify-between sm:justify-end text-[12px] text-zinc-600 dark:text-zinc-400 px-1">
            <div className="inline-flex gap-3">
              <span>{wordCount} words</span>
              {/* {lastUpdatedAt && (
                <span className="hidden sm:inline">
                  Last saved: {lastUpdatedAt}
                </span>
              )} */}
            </div>
          </div>
        )}
        <AIMotivationalPost
          identity={journalData.whoIAm}
          journalEntries={allJournalEntries.map((entry) => ({
            entry_date: entry.entry_date,
            content: htmlToMarkdown(entry.content) || "",
          }))}
        />
      </section>

      {/* Mobile sticky formatting toolbar - COMMENTED OUT */}
      {/* {editor && !isFocusMode && (
        <>
          {/* Minimalistic arrow toggle - centered above/at bottom */}
      {/* <button
            onClick={() => setIsMobileBarVisible(!isMobileBarVisible)}
            className={`sm:hidden fixed left-1/2 transform -translate-x-1/2 z-50 p-1.5 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-all duration-200 ${
              isMobileBarVisible ? "bottom-12" : "bottom-8"
            }`}
            title={isMobileBarVisible ? "Hide toolbar" : "Show toolbar"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className={`transition-transform duration-200 ${
                isMobileBarVisible ? "rotate-180" : ""
              }`}
            >
              <path
                d="M12 10L8 6L4 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-t border-zinc-200 dark:border-zinc-700">
            {/* Toolbar buttons */}
      {/* {isMobileBarVisible && (
              <div className="px-1.5 py-2 [@supports(padding:max(0px))]:pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                <div className="flex items-center gap-1 overflow-x-auto">
                  {/* Basic formatting */}
      {/* <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleBold().run();
                    }}
                    className={`px-2 py-1.5 text-xs rounded-md font-semibold whitespace-nowrap ${
                      isActive("bold")
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                    title="Bold (⌘B)"
                  >
                    <span className="font-bold">B</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleItalic().run();
                    }}
                    className={`px-2 py-1.5 text-xs rounded-md font-semibold whitespace-nowrap ${
                      isActive("italic")
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                    title="Italic (⌘I)"
                  >
                    <span className="italic">I</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleUnderline().run();
                    }}
                    className={`px-2 py-1.5 text-xs rounded-md font-semibold whitespace-nowrap ${
                      isActive("underline")
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                    title="Underline (⌘U)"
                  >
                    <span className="underline underline-offset-2 decoration-2">
                      U
                    </span>
                  </button>

                  {/* Divider */}
      {/* <div className="mx-1 h-5 w-px bg-zinc-300 dark:bg-zinc-600" />

                  {/* Structure formatting */}
      {/* <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleHeading({ level: 2 }).run();
                    }}
                    className={`px-2 py-1.5 text-xs rounded-md whitespace-nowrap ${
                      isActive("heading", { level: 2 })
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                    title="Section (H2)"
                  >
                    <span>H2</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleBlockquote().run();
                    }}
                    className={`px-2 py-1.5 text-xs rounded-md whitespace-nowrap ${
                      isActive("blockquote")
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                    title="Quote"
                  >
                    <span>❝</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleBulletList().run();
                    }}
                    className={`px-2 py-1.5 text-xs rounded-md whitespace-nowrap ${
                      isActive("bulletList")
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                    title="Bulleted List"
                  >
                    <span>•</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().toggleOrderedList().run();
                    }}
                    className={`px-2 py-1.5 text-xs rounded-md whitespace-nowrap ${
                      isActive("orderedList")
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                    title="Numbered List"
                  >
                    <span>1.</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().setHorizontalRule().run();
                    }}
                    className="px-2 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 whitespace-nowrap"
                    title="Divider"
                  >
                    <span>—</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().undo().run();
                    }}
                    className="px-2 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 whitespace-nowrap"
                    title="Undo (⌘Z)"
                  >
                    <span>↶</span>
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().redo().run();
                    }}
                    className="px-2 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 whitespace-nowrap"
                    title="Redo (⇧⌘Z)"
                  >
                    <span>↷</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )} */}
    </div>
  );
}
