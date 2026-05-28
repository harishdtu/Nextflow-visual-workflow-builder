"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            NextFlow AI
          </h1>
          <p className="text-gray-400 text-sm">Visual AI Workflow Builder</p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-[#18181b] border border-[#333] shadow-2xl rounded-2xl",

              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",

              // ✅ Fix: white background so Google logo/text is visible
              socialButtonsBlockButton:
                "bg-white border border-[#ddd] text-gray-800 hover:bg-gray-100 hover:border-gray-300 transition-colors",
              socialButtonsBlockButtonText: "text-gray-800 font-medium",
              socialButtonsBlockButtonArrow: "text-gray-600",

              // Divider
              dividerLine: "bg-[#444]",
              dividerText: "text-gray-500",

              formFieldLabel: "text-gray-300",
              formFieldInput:
                "bg-[#0f0f0f] border-[#444] text-white placeholder-gray-600 focus:border-purple-500",

              footerActionText: "text-gray-400",
              footerActionLink: "text-purple-400 hover:text-purple-300",

              formButtonPrimary:
                "bg-purple-600 hover:bg-purple-700 text-white transition-colors",

              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-purple-400",
            },
          }}
        />
      </div>
    </div>
  );
}