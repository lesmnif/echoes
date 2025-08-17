"use client";

import { useState, useEffect } from "react";
import { experimental_useObject } from "ai/react";
import { MotivationalPost as MotivationalPostType } from "@/app/api/motivational-post/schema";
import {
  generateMotivationalImages,
  GeneratedImage,
} from "@/utils/imageGenerator";
import MotivationalPost from "./MotivationalPost";
import { motivationalPostSchema } from "@/app/api/motivational-post/schema";
import { motion } from "framer-motion";
import { z } from "zod";

// Type for the complete AI response including root-level properties
type AIResponse = z.infer<typeof motivationalPostSchema>;

interface AIMotivationalPostProps {
  theme?: string;
  style?: string;
  identity?: string;
  journal?: string; // Keep for backward compatibility
  journalEntries?: Array<{
    entry_date: string;
    content: string;
  }>;
}

export default function AIMotivationalPost({
  theme,
  style,
  identity,
  journal,
  journalEntries,
}: AIMotivationalPostProps) {
  console.log("journalEntries", journalEntries);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPostReady, setIsPostReady] = useState(false);
  const [completePost, setCompletePost] = useState<any>(null);

  const { submit, isLoading, object, error } = experimental_useObject({
    api: "/api/motivational-post",
    schema: motivationalPostSchema,
    onError: (error) => {
      console.error("=== GENERATION ERROR ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    },
    onFinish: async ({ object: finishObject }) => {
      console.log("=== CLIENT-SIDE GENERATION COMPLETE ===");
      console.log("Finish object received:", finishObject);
      console.log("Current object state:", object);
      console.log("Is loading:", isLoading);

      // Use the object state instead of the finishObject parameter
      if (object != null && object.post) {
        const aiResponse = object as AIResponse;
        console.log("=== POST DETAILS (CLIENT) ===");
        console.log("Theme:", aiResponse.post.theme);
        console.log("Style:", aiResponse.post.style);
        console.log("Caption:", aiResponse.caption);
        console.log("Hashtags:", aiResponse.hashtags);
        console.log("Description:", aiResponse.description);
        console.log("=== SLIDES DETAILS (CLIENT) ===");
        if (aiResponse.post.slides && Array.isArray(aiResponse.post.slides)) {
          aiResponse.post.slides.forEach((slide: any, index: number) => {
            console.log(`Slide ${index + 1}:`);
            console.log("  - ID:", slide.id);
            console.log("  - Background Color:", slide.backgroundColor);
            console.log("  - Text Color:", slide.textColor);
            console.log("  - Font Family:", slide.fontFamily);
            console.log("  - Font Size:", slide.fontSize);
            console.log("  - Font Weight:", slide.fontWeight);
            console.log("  - Text Align:", slide.textAlign);
            console.log("  - Title:", slide.content?.title);
            console.log("  - Subtitle:", slide.content?.subtitle);
            console.log("  - Body:", slide.content?.body);
            console.log("  - Text Position X:", slide.textPosition?.x);
            console.log("  - Text Position Y:", slide.textPosition?.y);
          });
        }

        // Mark post as ready and store complete object
        setIsPostReady(true);
        setCompletePost(aiResponse);

        setIsGenerating(true);
        try {
          const images = await generateMotivationalImages(object.post as any);
          setGeneratedImages(images);
        } catch (err) {
          console.error("Error generating images:", err);
        } finally {
          setIsGenerating(false);
        }
      } else {
        console.log("Object is null or doesn't have post property");
        console.log("Full object:", JSON.stringify(object, null, 2));
      }
    },
  });

  // Effect to detect when generation is complete and we have data
  useEffect(() => {
    if (
      !isLoading &&
      object?.post &&
      hasPartialData(object.post) &&
      !isPostReady
    ) {
      console.log("=== DETECTED COMPLETE POST ===");
      console.log("Setting post as ready from useEffect");
      setIsPostReady(true);
      setCompletePost(object.post);
    }
  }, [isLoading, object, isPostReady]);

  // Convert AI-generated post to the format expected by MotivationalPost component
  const convertToSlides = (post: any) => {
    if (!post.slides || !Array.isArray(post.slides)) {
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

  // Helper function to check if we have any usable data to show
  const hasPartialData = (post: any) => {
    const hasData =
      post &&
      post.slides &&
      Array.isArray(post.slides) &&
      post.slides.length > 0 &&
      post.slides.some((slide: any) => slide.content?.title);
    console.log("hasPartialData check:", hasData, post);
    return hasData;
  };

  // Download function for Instagram-ready images
  const downloadSlides = async () => {
    if (!completePost) return;

    const html2canvas = (await import("html2canvas")).default;

    // Ensure web fonts are loaded
    await document.fonts.ready;

    // Select all slides
    const slideElements =
      document.querySelectorAll<HTMLElement>("[data-slide-id]");

    if (slideElements.length === 0) {
      console.error("No slide elements found");
      return;
    }

    for (let i = 0; i < slideElements.length; i++) {
      const slideElement = slideElements[i] as HTMLElement;

      // Ensure container size is set in CSS to 1080x1350px!

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
        link.download = `motivational-slide-${i + 1}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error(`Error converting slide ${i + 1} to image:`, error);
      }
    }
  };

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error generating post</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Show preview while loading - show as soon as we have any data */}
      {isLoading && object?.post && hasPartialData(object.post) && (
        <motion.div
          className="opacity-50"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 0.5 }}
        >
          <MotivationalPost
            slides={convertToSlides(object.post)}
            caption={(object as AIResponse)?.caption || undefined}
            hashtags={
              (object as AIResponse)?.hashtags?.filter(
                (tag: string): tag is string => tag !== undefined
              ) || undefined
            }
            theme={object.post.theme || undefined}
            style={object.post.style || undefined}
          />
        </motion.div>
      )}

      {/* Show spinner when loading but no data yet */}
      {isLoading && (!object?.post || !hasPartialData(object?.post)) && (
        <motion.div
          className="w-full max-w-md mx-auto p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-zinc-600 dark:text-zinc-400">
              Generating motivational post...
            </span>
          </div>
        </motion.div>
      )}

      {/* Show final result when complete - use hasPartialData instead of isPostComplete */}
      {!isLoading && object?.post && hasPartialData(object.post) && (
        <motion.div initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}>
          <MotivationalPost
            slides={convertToSlides(object.post)}
            caption={(object as AIResponse)?.caption || undefined}
            hashtags={
              (object as AIResponse)?.hashtags?.filter(
                (tag: string): tag is string => tag !== undefined
              ) || undefined
            }
            theme={object.post.theme || undefined}
            style={object.post.style || undefined}
          />
        </motion.div>
      )}

      {/* Download button when post is ready */}
      {isPostReady && completePost && (
        <motion.div
          className="w-full max-w-md mx-auto text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={downloadSlides}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Download Current Slide
          </button>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            Downloads PNG image
          </p>
        </motion.div>
      )}

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Generated Images
          </h3>
          <div className="space-y-4">
            {generatedImages.map((image, index) => (
              <div
                key={index}
                className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden"
              >
                <img
                  src={image.dataUrl}
                  alt={`Generated slide ${index + 1}`}
                  className="w-full h-auto"
                />
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Slide {index + 1} - {image.width}x{image.height}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading indicator for image generation */}
      {isGenerating && (
        <div className="w-full max-w-md mx-auto p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-600">Generating images...</p>
        </div>
      )}

      {/* Generate button when no post exists */}
      {!object || !object.post ? (
        <div className="w-full max-w-md mx-auto space-y-4">
          <div className="text-center">
            <button
              onClick={() => {
                submit({
                  theme: theme || "General motivation and success",
                  style: style || "Direct and powerful",
                  identity: identity || "",
                  journal: journalEntries || [],
                });
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Generate Motivational Post
            </button>
          </div>
          <p className="text-center text-zinc-600 dark:text-zinc-400 text-sm">
            Click the button above to generate a new motivational post with AI
          </p>
        </div>
      ) : null}
    </div>
  );
}
