import "@/app/(preview)/globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-sdk-preview-use-object.vercel.dev"),
  title: "Schema Generation Preview",
  description: "Experimental preview of schema generation with useObject hook.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <Toaster position="top-center" richColors />
        <div className="max-w-5xl mx-auto  pt-6">
          <div className="after:content-[''] after:block after:h-px after:bg-zinc-200/60 dark:after:bg-zinc-700/60 after:mt-2" />
          {children}
        </div>
      </body>
    </html>
  );
}
