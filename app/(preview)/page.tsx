"use client";

import AIMotivationalPost from "@/components/AIMotivationalPost";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-zinc-50 dark:bg-zinc-900 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            AI-Generated Motivational Posts
          </h1>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
            Generate powerful motivational posts with AI. Each post includes 2
            slides with custom styling, generated images, and ready-to-use
            captions for social media.
          </p>

          {/* Journal Link */}
          <div className="mb-8">
            <Link
              href="/journal"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              <span className="mr-2">📝</span>
              Personalize Your Posts
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
              Set up your journal to make posts that sound like you
            </p>
          </div>
        </div>

        <AIMotivationalPost
          theme="Discipline and hard work"
          style="Direct and aggressive"
        />
      </div>
    </div>
  );
}
