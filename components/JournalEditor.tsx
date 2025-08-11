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

interface JournalEditorProps {
  initialIdentity: string;
  initialEntry: string;
}

export default function JournalEditor({
  initialIdentity,
  initialEntry,
}: JournalEditorProps) {
  // Initialize with server-loaded data or fallback defaults
  const [journalData, setJournalData] = useState<JournalData>({
    whoIAm:
      initialIdentity ||
      `I'm an engineer, builder, and creative thinker who can't help but see the world as a set of systems waiting to be improved — or completely reimagined. I'm obsessed with the intersection of AI, education, and self-growth, because I believe the right tools can unlock potential in people they didn't even know they had. I'm not here to chase shiny trends or build for vanity metrics; I want to create things that last, tools and frameworks that people can carry through different seasons of life.

I value responsibility — owning my decisions, my time, my outcomes. I crave autonomy — the space to think, to build, to push boundaries without asking for permission. And I'm fueled by purpose — the kind of vision that keeps you working when nobody's watching, that makes you choose the hard road because it's the one that matters.

Fitness isn't just a hobby; it's my way of training discipline and resilience in every other part of life. Storytelling isn't just entertainment; it's how I make meaning, connect ideas, and inspire action. Technology isn't just code; it's leverage — a way to scale impact beyond my own reach.

I plan to live intentionally — designing my days around health, clarity, and meaningful work. My idea of success isn't "more" for the sake of more, but building a life and systems that align with my values, challenge my limits, and empower others along the way. I want my work to outlive me, and I'm willing to take uncomfortable risks to make that happen.

Underneath all of it, there's this restless question: How far can my "why" really take me?`,
  });

  // Initialize with server-loaded data or fallback default
  const [entry, setEntry] = useState<string>(
    initialEntry ||
      `<h2><strong>Random ideas you've had lately</strong></h2><br><p>feeling stuck lately<br>been thinking about moving cities</p><br><h2><strong>Things you've been thinking deeply about</strong></h2><br><p>we're all one decision away from a completely different life<br>what if i just... <strong>changed everything tomorrow</strong><br>sometimes wonder if what i'm building actually matters or if i'm just chasing shiny objects</p><br><h2><strong>Something you learned recently</strong></h2><br><p>saw this quote: <em>"comfort is the enemy of mastery"</em> - hit different<br>everyone on social media is just performing instead of being real. am i doing that too?</p><br><h2><strong>Questions you've been asking yourself</strong></h2><br><p>been playing it way too safe recently. need to take more risks?<br>maybe need to be more <strong>aggressive</strong> about what i want?<br>or maybe i'm overthinking everything lol</p><br><h2><strong>Quotes you love (with why you like them)</strong></h2><br><p><em>"comfort is the enemy of mastery"</em> - because it's calling me out<br><em>"the only way out is through"</em> - reminds me to face hard things</p><br><h2><strong>Random brain dumps</strong></h2><br><p>not making enough progress on goals<br>life feels too <u>comfortable</u> rn and that's probably not good<br>random thought: why do we wait for "the right time" for everything<br><strong>what if there is no right time?</strong></p><br><h2><strong>Current mood/feelings</strong></h2><br><p>need to figure out what i really care about<br>or just taking bigger risks in general<br>feeling like i'm on the edge of something big</p>`
  );

  const [wordCount, setWordCount] = useState(0);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("");
  const [, setToolbarTick] = useState(0);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [entryTitle, setEntryTitle] = useState("Daily Journal");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [isMobileBarVisible, setIsMobileBarVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>("");

  // Simple save function that makes a POST request
  const saveToDatabase = async () => {
    try {
      setIsSaving(true);
      setSaveStatus("Saving...");

      const response = await fetch("/api/save-journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identity: journalData.whoIAm,
          entry: entry,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setSaveStatus("Saved successfully!");
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

  const htmlToMarkdown = (html: string): string => {
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
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {todayLabel || "Loading..."}
        </span>
      </div>

      {/* Editor card (clean, stoic) */}
      <section>
        <div className="rounded-xl sm:rounded-2xl p-0 border border-zinc-200/70 dark:border-zinc-700/70 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm shadow-[0_1px_0_0_rgba(0,0,0,0.02)] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] transition-shadow">
          <div className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
              <div className="flex-1 w-full sm:w-auto">
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
                      className="w-full text-2xl font-serif font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 bg-transparent border-none outline-none focus:ring-0 p-0"
                      autoFocus
                    />
                  </div>
                ) : (
                  <h1
                    onClick={() => setIsEditingTitle(true)}
                    className="font-serif text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    title="Click to edit title"
                  >
                    {entryTitle}
                  </h1>
                )}

                {!isFocusMode && (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                      Write with honesty. Keep it raw and unfiltered.
                    </p>
                  </div>
                )}
              </div>

              {/* Toolbar toggle - hidden on mobile */}
              {!isFocusMode && editor && (
                <button
                  onClick={() => setIsToolbarVisible(!isToolbarVisible)}
                  className="hidden sm:block px-3 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 border border-zinc-200/70 dark:border-zinc-700/70 transition-all duration-200 whitespace-nowrap self-start sm:self-auto"
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
          journal={htmlToMarkdown(entry)}
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
