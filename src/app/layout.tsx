import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/i18n/context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Niseth Code — Intelligent Resume Builder & Career Suite",
  description:
    "Craft high-impact, ATS-optimized resumes with Niseth Code. Live preview canvas, curated templates, AI writing copilot, and watermark-free PDF exports. Free forever.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,100..700;1,100..700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var clean=function(el){if(el&&el.removeAttribute){if(el.hasAttribute('bis_skin_checked'))el.removeAttribute('bis_skin_checked');if(el.hasAttribute('bis_register'))el.removeAttribute('bis_register');}};var obs=new MutationObserver(function(muts){for(var i=0;i<muts.length;i++){var m=muts[i];if(m.type==='attributes'){clean(m.target);}else if(m.type==='childList'){for(var j=0;j<m.addedNodes.length;j++){var n=m.addedNodes[j];if(n.nodeType===1){clean(n);if(n.querySelectorAll){var cs=n.querySelectorAll('[bis_skin_checked],[bis_register]');for(var k=0;k<cs.length;k++)clean(cs[k]);}}}}}});obs.observe(document.documentElement,{attributes:true,attributeFilter:['bis_skin_checked','bis_register'],childList:true,subtree:true});}catch(e){}})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-background text-foreground"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
            <Toaster position="bottom-center" />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
