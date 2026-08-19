import { Inter } from "next/font/google";

import AppShell from "@/components/layout/AppShell";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Review candidate resumes and ask an AI assistant grounded questions about a selected resume.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-ink focus:shadow-md"
        >
          Skip to content
        </a>

        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
