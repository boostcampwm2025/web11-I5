import type { Metadata } from "next";
import Script from "next/script";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import { cn } from "@/lib/cn";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";

import "./globals.css";

const pretendard = localFont({
  src: "../assets/fonts/PretendardVariable.woff2",
});

export const metadata: Metadata = {
  title: "말만해",
  description: "말로 설명하고, AI로 구조화하며, 습관처럼 학습하자!",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="ko">
      <body
        className={cn(
          pretendard.className,
          "antialiased bg-slate-50 w-full flex flex-col items-center",
        )}
      >
        <Header />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              marginTop: "15vh",
            },
          }}
          reverseOrder={false}
        />

        <Footer />
        <Script
          src="https://kr.object.ncloudstorage.com/boostad-sdk-dev/sdk/sdk.js"
          data-blog-key={process.env.BOOSTAD_BLOG_KEY || "test-local"}
          data-auto="false"
          data-context="말하면서 CS 지식을 학습할 수 있는 서비스"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

export default RootLayout;
