import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StripeFlow — The most complete MCP server for Stripe",
  description:
    "Manage your entire Stripe account — customers, subscriptions, invoices, and analytics — with natural language. 79 tools. One command. Works with Claude, Cursor, Windsurf.",
  keywords: [
    "StripeFlow",
    "MCP",
    "Model Context Protocol",
    "Stripe",
    "Claude",
    "Cursor",
    "Windsurf",
    "AI payments",
    "open source",
  ],
  authors: [{ name: "StripeFlow contributors" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    title: "StripeFlow — The most complete MCP server for Stripe",
    description:
      "79 tools. 19 categories. One command. Manage your entire Stripe account with natural language. Works with Claude, Cursor, Windsurf.",
    url: "https://stripeflow-mcp.vercel.app",
    siteName: "StripeFlow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StripeFlow — The most complete MCP server for Stripe",
    description:
      "79 tools. 19 categories. One command. Manage your entire Stripe account with natural language.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
