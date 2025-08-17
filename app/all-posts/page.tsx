"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import MotivationalPost from "@/components/MotivationalPost";

interface AIGeneration {
  id: string;
  user_id: string;
  prompt_sent: string;
  ai_response: any;
  model_used: string;
  generation_type: string;
  created_at: string;
  summary: string | null;
}

export default function AllPostsPage() {
  const [posts, setPosts] = useState<AIGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editablePosts, setEditablePosts] = useState<AIGeneration[]>([]);
  const [editingField, setEditingField] = useState<{
    postIndex: number;
    slideIndex: number;
    field: "title" | "subtitle" | "body";
  } | null>(null);
  const [editingCaption, setEditingCaption] = useState<{
    postIndex: number;
  } | null>(null);
  const [showBodyEditor, setShowBodyEditor] = useState<{
    postIndex: number;
    slideIndex: number;
    currentText: string;
    field?: "title" | "body";
  } | null>(null);

  async function checkAuthAndFetchPosts() {
    try {
      const response = await fetch("/api/all-posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data.posts || []);
      setEditablePosts(data.posts || []); // Initialize editable posts
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const updateSlideContent = (
    postIndex: number,
    slideIndex: number,
    field: "title" | "subtitle" | "body",
    value: string
  ) => {
    setEditablePosts((prev) =>
      prev.map((post, index) => {
        if (index !== postIndex) return post;

        const updatedResponse = { ...post.ai_response };
        if (updatedResponse.post && updatedResponse.post.slides) {
          updatedResponse.post.slides = updatedResponse.post.slides.map(
            (slide: any, slideIdx: number) =>
              slideIdx === slideIndex
                ? { ...slide, content: { ...slide.content, [field]: value } }
                : slide
          );
        }

        return { ...post, ai_response: updatedResponse };
      })
    );
  };

  const updateCaption = (postIndex: number, value: string) => {
    setEditablePosts((prev) =>
      prev.map((post, index) => {
        if (index !== postIndex) return post;

        const updatedResponse = { ...post.ai_response };
        updatedResponse.caption = value;

        return { ...post, ai_response: updatedResponse };
      })
    );
  };

  const handleTextClick = (
    postIndex: number,
    slideIndex: number,
    field: "title" | "subtitle" | "body"
  ) => {
    if (field === "body") {
      const currentText =
        editablePosts[postIndex]?.ai_response?.post?.slides?.[slideIndex]
          ?.content?.body || "";
      setShowBodyEditor({ postIndex, slideIndex, currentText });
    } else if (field === "title" && slideIndex === 0) {
      // Slide 1 title - use modal
      const currentText =
        editablePosts[postIndex]?.ai_response?.post?.slides?.[slideIndex]
          ?.content?.title || "";
      setShowBodyEditor({
        postIndex,
        slideIndex,
        currentText: currentText,
        field: "title",
      });
    } else {
      setEditingField({ postIndex, slideIndex, field });
    }
  };

  const handleTextBlur = () => {
    setEditingField(null);
  };

  const handleCaptionClick = (postIndex: number) => {
    setEditingCaption({ postIndex });
  };

  const handleCaptionBlur = () => {
    setEditingCaption(null);
  };

  useEffect(() => {
    checkAuthAndFetchPosts();
  }, []);

  // Convert AI response to the format expected by MotivationalPost
  const convertToSlides = (aiResponse: any) => {
    // The ai_response contains the full response, we need to extract the post
    const post = aiResponse?.post || aiResponse;

    if (!post?.slides || !Array.isArray(post.slides)) {
      console.log("No slides found in post:", post);
      return [];
    }

    return post.slides.map((slide: any) => ({
      id: slide.id || 1,
      backgroundColor: slide.backgroundColor || "#000000",
      textColor: slide.textColor || "#ffffff",
      fontFamily: slide.fontFamily || "serif",
      fontSize: slide.fontSize || "text-4xl",
      fontWeight: slide.fontWeight || "font-bold",
      textAlign: slide.textAlign || "text-center",
      content: {
        title: slide.content?.title || "",
        subtitle: slide.content?.subtitle || "",
        body: slide.content?.body || "",
      },
      textPosition: slide.textPosition || { x: "center", y: "center" },
    }));
  };

  // Download function for slides
  const downloadSlide = async (postId: string, slides: any[]) => {
    if (!slides || slides.length === 0) return;

    const html2canvas = (await import("html2canvas")).default;

    // Ensure web fonts are loaded
    await document.fonts.ready;

    // Find the slide element for this specific post
    const slideElement = document.querySelector(
      `[data-post-id="${postId}"] [data-slide-id]`
    ) as HTMLElement;

    if (!slideElement) {
      console.error("No slide element found for post:", postId);
      return;
    }

    try {
      const canvas = await html2canvas(slideElement, {
        backgroundColor: slideElement.style.backgroundColor || "#000",
        useCORS: true,
        allowTaint: true,
        scale: 2,
        logging: false,
      });

      // Download logic
      const link = document.createElement("a");
      link.download = `motivational-post-${postId}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Error converting slide to image:`, error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading posts...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">
              Error: {error}
            </p>
            {error === "Please log in to view your posts" && (
              <p className="text-gray-600 dark:text-gray-400">
                Please log in to your account to view your motivational posts.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Motivational Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {posts.length} post{posts.length !== 1 ? "s" : ""} found
          </p>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            💡 Click any text to edit (changes are temporary)
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No motivational posts found. Create your first post to get
              started!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {editablePosts.map((post, index) => {
              const slides = convertToSlides(post.ai_response);

              if (slides.length === 0) {
                return (
                  <div
                    key={index}
                    className="w-full max-w-xl mx-auto bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Invalid post data
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  data-post-id={index}
                  className="w-full max-w-xl mx-auto bg-white dark:bg-gray-800  p-4 border border-gray-200 dark:border-gray-700"
                >
                  {/* Custom larger slide display */}
                  <div className="w-full">
                    {/* Main Slide Display */}
                    <div
                      className="aspect-[4/5] overflow-hidden relative"
                      style={{
                        backgroundColor: slides[currentSlide]?.backgroundColor,
                      }}
                      data-slide-id={slides[currentSlide]?.id}
                    >
                      <div
                        className={`absolute inset-0 flex flex-col justify-center p-12 ${
                          slides[currentSlide]?.id === 1
                            ? "items-center text-center"
                            : "items-start text-left"
                        }`}
                      >
                        {/* Slide 1 Style - Single powerful sentence */}
                        {slides[currentSlide]?.id === 1 ? (
                          <div className="space-y-8">
                            {editingField?.postIndex === index &&
                            editingField?.slideIndex === currentSlide &&
                            editingField?.field === "title" ? (
                              <textarea
                                value={
                                  slides[currentSlide]?.content?.title || ""
                                }
                                onChange={(e) =>
                                  updateSlideContent(
                                    index,
                                    currentSlide,
                                    "title",
                                    e.target.value
                                  )
                                }
                                onBlur={handleTextBlur}
                                className="w-full bg-transparent border-none outline-none resize-none leading-tight"
                                aria-label="Edit slide title"
                                style={{
                                  color:
                                    slides[currentSlide]?.textColor ||
                                    "#ffffff",
                                  fontFamily:
                                    slides[currentSlide]?.fontFamily === "serif"
                                      ? "Georgia, serif"
                                      : slides[currentSlide]?.fontFamily ===
                                        "monospace"
                                      ? "Courier New, monospace"
                                      : "Arial, sans-serif",
                                  fontSize: "1.25rem",
                                  textAlign:
                                    slides[currentSlide]?.textAlign ===
                                    "text-center"
                                      ? "center"
                                      : slides[currentSlide]?.textAlign ===
                                        "text-left"
                                      ? "left"
                                      : "center",
                                }}
                                autoFocus
                              />
                            ) : (
                              <h1
                                className="leading-tight cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  handleTextClick(index, currentSlide, "title")
                                }
                                style={{
                                  color:
                                    slides[currentSlide]?.textColor ||
                                    "#ffffff",
                                  fontFamily:
                                    slides[currentSlide]?.fontFamily === "serif"
                                      ? "Georgia, serif"
                                      : slides[currentSlide]?.fontFamily ===
                                        "monospace"
                                      ? "Courier New, monospace"
                                      : "Arial, sans-serif",
                                  fontSize: "1.25rem",
                                  textAlign:
                                    slides[currentSlide]?.textAlign ===
                                    "text-center"
                                      ? "center"
                                      : slides[currentSlide]?.textAlign ===
                                        "text-left"
                                      ? "left"
                                      : "center",
                                  whiteSpace: "pre-line",
                                }}
                              >
                                {slides[currentSlide]?.content?.title}
                              </h1>
                            )}
                          </div>
                        ) : (
                          /* Slide 2 Style - Title + Body text */
                          <div className="space-y-6 max-w-2xl">
                            <div className="space-y-3">
                              {editingField?.postIndex === index &&
                              editingField?.slideIndex === currentSlide &&
                              editingField?.field === "title" ? (
                                <textarea
                                  value={
                                    slides[currentSlide]?.content?.title || ""
                                  }
                                  onChange={(e) =>
                                    updateSlideContent(
                                      index,
                                      currentSlide,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  onBlur={handleTextBlur}
                                  className="w-full bg-transparent border-none outline-none resize-none leading-tight"
                                  aria-label="Edit slide title"
                                  style={{
                                    color:
                                      slides[currentSlide]?.textColor ||
                                      "#000000",
                                    fontFamily:
                                      slides[currentSlide]?.fontFamily ===
                                      "serif"
                                        ? "Georgia, serif"
                                        : slides[currentSlide]?.fontFamily ===
                                          "monospace"
                                        ? "Courier New, monospace"
                                        : "Arial, sans-serif",
                                    fontSize: "1.5rem",
                                    fontWeight: "bold",
                                    textAlign:
                                      slides[currentSlide]?.textAlign ===
                                      "text-center"
                                        ? "center"
                                        : slides[currentSlide]?.textAlign ===
                                          "text-left"
                                        ? "left"
                                        : "left",
                                    textDecorationThickness: "1px",
                                    textUnderlineOffset: "0.2em",
                                    marginBottom: "1.25rem",
                                    position: "relative" as const,
                                    fontStyle: "italic",
                                    lineHeight: "1.2",
                                    borderLeft: `5px solid ${
                                      slides[currentSlide]?.textColor ||
                                      "#000000"
                                    }`,
                                    paddingLeft: "0.75rem",
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <h2
                                  className="leading-tight cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() =>
                                    handleTextClick(
                                      index,
                                      currentSlide,
                                      "title"
                                    )
                                  }
                                  style={{
                                    color:
                                      slides[currentSlide]?.textColor ||
                                      "#000000",
                                    fontFamily:
                                      slides[currentSlide]?.fontFamily ===
                                      "serif"
                                        ? "Georgia, serif"
                                        : slides[currentSlide]?.fontFamily ===
                                          "monospace"
                                        ? "Courier New, monospace"
                                        : "Arial, sans-serif",
                                    fontSize: "1.5rem",
                                    fontWeight: "bold",
                                    textAlign:
                                      slides[currentSlide]?.textAlign ===
                                      "text-center"
                                        ? "center"
                                        : slides[currentSlide]?.textAlign ===
                                          "text-left"
                                        ? "left"
                                        : "left",
                                    textDecorationThickness: "1px",
                                    textUnderlineOffset: "0.2em",
                                    marginBottom: "1.25rem",
                                    position: "relative" as const,
                                    fontStyle: "italic",
                                    lineHeight: "1.2",
                                    borderLeft: `5px solid ${
                                      slides[currentSlide]?.textColor ||
                                      "#000000"
                                    }`,
                                    paddingLeft: "0.75rem",
                                    whiteSpace: "pre-line",
                                  }}
                                >
                                  {slides[currentSlide]?.content?.title}.
                                </h2>
                              )}
                              {slides[currentSlide]?.content?.subtitle && (
                                <p
                                  className="italic"
                                  style={{
                                    color:
                                      slides[currentSlide]?.textColor ||
                                      "#ffffff",
                                    fontFamily:
                                      slides[currentSlide]?.fontFamily ===
                                      "serif"
                                        ? "Georgia, serif"
                                        : slides[currentSlide]?.fontFamily ===
                                          "monospace"
                                        ? "Courier New, monospace"
                                        : "Arial, sans-serif",
                                    fontSize: "0.875rem",
                                    opacity: 0.9,
                                  }}
                                >
                                  {slides[currentSlide]?.content?.subtitle}
                                </p>
                              )}
                            </div>
                            {slides[currentSlide]?.content?.body && (
                              <div
                                className="space-y-3 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  handleTextClick(index, currentSlide, "body")
                                }
                              >
                                {slides[currentSlide]?.content?.body
                                  .split("\n\n")
                                  .filter(
                                    (paragraph: string) =>
                                      paragraph.trim().length > 0
                                  )
                                  .map(
                                    (
                                      paragraph: string,
                                      index: number,
                                      array: string[]
                                    ) => {
                                      const isLastParagraph =
                                        index === array.length - 1;
                                      return (
                                        <p
                                          key={index}
                                          className={`leading-relaxed ${
                                            isLastParagraph
                                              ? "italic text-right"
                                              : ""
                                          }`}
                                          style={{
                                            color: isLastParagraph
                                              ? slides[currentSlide]
                                                  ?.textColor === "#ffffff" ||
                                                slides[currentSlide]
                                                  ?.textColor === "#000000"
                                                ? slides[currentSlide]
                                                    ?.textColor
                                                : "#ffffff"
                                              : slides[currentSlide]
                                                  ?.textColor || "#ffffff",
                                            fontFamily:
                                              slides[currentSlide]
                                                ?.fontFamily === "serif"
                                                ? "Georgia, serif"
                                                : slides[currentSlide]
                                                    ?.fontFamily === "monospace"
                                                ? "Courier New, monospace"
                                                : "Arial, sans-serif",
                                            fontSize: isLastParagraph
                                              ? "0.95rem"
                                              : "0.9rem",
                                            opacity: isLastParagraph ? 1 : 0.95,
                                            filter: isLastParagraph
                                              ? "brightness(1.15)"
                                              : "none",
                                            textDecoration: isLastParagraph
                                              ? "underline"
                                              : "none",
                                            textDecorationThickness:
                                              isLastParagraph
                                                ? "1.5px"
                                                : "auto",
                                            textUnderlineOffset: isLastParagraph
                                              ? "0.3em"
                                              : "auto",
                                            textDecorationColor: isLastParagraph
                                              ? slides[currentSlide]
                                                  ?.textColor || "#ffffff"
                                              : "currentColor",
                                            paddingTop: isLastParagraph
                                              ? "1.25rem"
                                              : "0.75rem",
                                            whiteSpace: "pre-line",
                                          }}
                                        >
                                          {paragraph}
                                        </p>
                                      );
                                    }
                                  )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Slide Indicators */}
                    {slides.length > 1 && (
                      <div className="flex justify-center mt-4 space-x-2">
                        {slides.map((slide: any, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              index === currentSlide
                                ? "bg-zinc-900 dark:bg-zinc-100"
                                : "bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Instagram Post Elements */}
                    <div className="mt-4 space-y-3">
                      {/* Caption */}
                      <div className="text-sm text-zinc-900 dark:text-zinc-100">
                        <span className="font-semibold mr-2">
                          motivation_master
                        </span>
                        <span>
                          {post.ai_response?.post?.caption
                            ? post.ai_response?.post?.caption
                            : post.ai_response?.caption
                            ? post.ai_response?.caption
                            : "Your dreams don't care about your comfort zone. They only care about your obsession. 🔥"}
                        </span>
                      </div>

                      {/* Hashtags */}
                      {post.ai_response?.hashtags?.length > 0 && (
                        <div>
                          {post.ai_response?.hashtags.map(
                            (tag: string, index: number) => (
                              <span
                                key={index}
                                className="text-blue-600 dark:text-blue-400"
                              >
                                {tag}
                              </span>
                            )
                          )}
                        </div>
                      )}
                      {post.ai_response?.post?.hashtags &&
                        post.ai_response.post.hashtags.length > 0 && (
                          <div className="text-sm text-zinc-900 dark:text-zinc-100">
                            <div className="flex flex-wrap gap-1">
                              {post.ai_response.post.hashtags
                                .filter(
                                  (tag: any): tag is string => tag !== undefined
                                )
                                .map((tag: string, index: number) => (
                                  <span
                                    key={index}
                                    className="text-blue-600 dark:text-blue-400"
                                  >
                                    {tag}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Download button */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => downloadSlide(post.id, slides)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      Download Slide
                    </button>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                      Downloads PNG image
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created: {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    {post.summary && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {post.summary}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Text Editor Modal */}
        {showBodyEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800  p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {showBodyEditor.field === "title"
                  ? "Edit Title"
                  : "Edit Body Text"}
              </h3>
              <textarea
                value={showBodyEditor.currentText}
                onChange={(e) =>
                  setShowBodyEditor((prev) =>
                    prev ? { ...prev, currentText: e.target.value } : null
                  )
                }
                className={`w-full p-4 border border-gray-300 dark:border-gray-600 resize-none text-gray-900 dark:text-white bg-white dark:bg-gray-700 ${
                  showBodyEditor.field === "title" ? "h-32" : "h-64"
                }`}
                placeholder={
                  showBodyEditor.field === "title"
                    ? "Edit the title here..."
                    : "Edit the body text here..."
                }
                autoFocus
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowBodyEditor(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showBodyEditor) {
                      updateSlideContent(
                        showBodyEditor.postIndex,
                        showBodyEditor.slideIndex,
                        showBodyEditor.field || "body",
                        showBodyEditor.currentText
                      );
                      setShowBodyEditor(null);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
