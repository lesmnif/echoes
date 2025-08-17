"use client";

import { useState } from "react";

interface Slide {
  id: number;
  backgroundColor: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: string;
  content: {
    title: string;
    subtitle?: string;
    body?: string;
  };
  textPosition?: {
    x: string;
    y: string;
  };
}

interface MotivationalPostProps {
  slides: Slide[];
  caption?: string;
  hashtags?: string[];
  theme?: string;
  style?: string;
}

export default function MotivationalPost({
  slides,
  caption,
  hashtags,
  theme,
  style,
}: MotivationalPostProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Slide Display */}
      <div
        className="aspect-[4/5] rounded-lg overflow-hidden relative"
        style={{ backgroundColor: currentSlideData.backgroundColor }}
        data-slide-id={currentSlideData.id}
      >
        <div
          className={`absolute inset-0 flex flex-col justify-center p-12 ${
            currentSlideData.id === 1
              ? "items-center text-center"
              : "items-start text-left"
          }`}
        >
          {/* Slide 1 Style - Single powerful sentence */}
          {currentSlideData.id === 1 ? (
            <div className="space-y-8">
              <h1
                className="leading-tight"
                style={{
                  color: currentSlideData.textColor || "#ffffff",
                  fontFamily:
                    currentSlideData.fontFamily === "serif"
                      ? "Georgia, serif"
                      : currentSlideData.fontFamily === "monospace"
                      ? "Courier New, monospace"
                      : "Arial, sans-serif",
                  fontSize: "1.25rem",
                  textAlign:
                    currentSlideData.textAlign === "text-center"
                      ? "center"
                      : currentSlideData.textAlign === "text-left"
                      ? "left"
                      : "center",
                }}
              >
                {currentSlideData.content.title}
              </h1>
            </div>
          ) : (
            /* Slide 2 Style - Title + Body text */
            <div className="space-y-6 max-w-sm">
              <div className="space-y-3">
                <h2
                  className="leading-tight"
                  style={{
                    color: currentSlideData.textColor || "#000000",
                    fontFamily:
                      currentSlideData.fontFamily === "serif"
                        ? "Georgia, serif"
                        : currentSlideData.fontFamily === "monospace"
                        ? "Courier New, monospace"
                        : "Arial, sans-serif",
                    fontSize: "1.35rem",
                    fontWeight: "bold",
                    textAlign:
                      currentSlideData.textAlign === "text-center"
                        ? "center"
                        : currentSlideData.textAlign === "text-left"
                        ? "left"
                        : "left",
                    textDecorationThickness: "1px",
                    textUnderlineOffset: "0.2em",
                    marginBottom: "1.25rem",
                    position: "relative" as const,
                    fontStyle: "italic",
                    lineHeight: "1.2",
                    borderLeft: `5px solid ${
                      currentSlideData.textColor || "#000000"
                    }`,
                    paddingLeft: "0.75rem",
                  }}
                >
                  {currentSlideData.content.title}.
                </h2>
                {currentSlideData.content.subtitle && (
                  <p
                    className="italic"
                    style={{
                      color: currentSlideData.textColor || "#ffffff",
                      fontFamily:
                        currentSlideData.fontFamily === "serif"
                          ? "Georgia, serif"
                          : currentSlideData.fontFamily === "monospace"
                          ? "Courier New, monospace"
                          : "Arial, sans-serif",
                      fontSize: "0.875rem",
                      opacity: 0.9,
                    }}
                  >
                    {currentSlideData.content.subtitle}
                  </p>
                )}
              </div>
              {currentSlideData.content.body && (
                <div className="space-y-3">
                  {currentSlideData.content.body
                    .split("\n\n")
                    .filter((paragraph) => paragraph.trim().length > 0)
                    .map((paragraph, index, array) => {
                      const isLastParagraph = index === array.length - 1;
                      return (
                        <p
                          key={index}
                          className={`leading-relaxed ${
                            isLastParagraph ? "italic text-right" : ""
                          }`}
                          style={{
                            color: isLastParagraph
                              ? currentSlideData.textColor === "#ffffff" ||
                                currentSlideData.textColor === "#000000"
                                ? currentSlideData.textColor
                                : "#ffffff"
                              : currentSlideData.textColor || "#ffffff",
                            fontFamily:
                              currentSlideData.fontFamily === "serif"
                                ? "Georgia, serif"
                                : currentSlideData.fontFamily === "monospace"
                                ? "Courier New, monospace"
                                : "Arial, sans-serif",
                            fontSize: isLastParagraph ? "0.95rem" : "0.9rem",
                            opacity: isLastParagraph ? 1 : 0.95,
                            filter: isLastParagraph
                              ? "brightness(1.15)"
                              : "none",
                            textDecoration: isLastParagraph
                              ? "underline"
                              : "none",
                            textDecorationThickness: isLastParagraph
                              ? "1.5px"
                              : "auto",
                            textUnderlineOffset: isLastParagraph
                              ? "0.3em"
                              : "auto",
                            textDecorationColor: isLastParagraph
                              ? currentSlideData.textColor || "#ffffff"
                              : "currentColor",
                            paddingTop: isLastParagraph ? "0.75rem" : "0",
                          }}
                        >
                          {paragraph}
                        </p>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Instagram Post Elements */}
      <div className="mt-4 space-y-3">
        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <button
            aria-label="Like post"
            className="text-zinc-900 dark:text-zinc-100 hover:text-red-500 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <button
            aria-label="Comment on post"
            className="text-zinc-900 dark:text-zinc-100 hover:text-blue-500 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
          <button
            aria-label="Share post"
            className="text-zinc-900 dark:text-zinc-100 hover:text-blue-500 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>
          <div className="flex-1"></div>
          <button
            aria-label="Save post"
            className="text-zinc-900 dark:text-zinc-100 hover:text-blue-500 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>

        {/* Likes */}
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          1,247 likes
        </div>

        {/* Caption */}
        <div className="text-sm text-zinc-900 dark:text-zinc-100">
          <span className="font-semibold mr-2">motivation_master</span>
          <span>
            {caption ||
              "Your dreams don't care about your comfort zone. They only care about your obsession. 🔥"}
            {theme && style && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-1">
                [DEBUG: Theme: {theme} | Style: {style}]
              </span>
            )}
          </span>
        </div>

        {/* Hashtags */}
        {hashtags && hashtags.length > 0 && (
          <div className="text-sm text-zinc-900 dark:text-zinc-100">
            <div className="flex flex-wrap gap-1">
              {hashtags.map((tag, index) => (
                <span key={index} className="text-blue-600 dark:text-blue-400">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* View all comments */}
        <button className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
          View all 89 comments
        </button>

        {/* Timestamp */}
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          2 hours ago
        </div>
      </div>
    </div>
  );
}
