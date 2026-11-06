import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { FloatingAiButton } from "@/components/ai/FloatingAiButton";

export const metadata: Metadata = {
  title: "PillReminder - Intelligent Medication Management Platform",
  description:
    "An integrated healthcare ecosystem connecting doctors, patients, pharmacies, and family caregivers for seamless prescription management and automated reminders.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
        <ToastProvider>
          {children}
          <FloatingAiButton />
        </ToastProvider>
      </body>
    </html>
  );
}
