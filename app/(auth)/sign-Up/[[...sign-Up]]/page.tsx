"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        
        {/* Branding */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            NextFlow 🚀
          </h1>
          <p className="text-gray-400 text-sm">
            Visual AI Workflow Builder
          </p>
        </div>

        {/* Clerk SignUp */}
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-[#1a1a1a] border border-[#333] shadow-xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-[#0f0f0f] border-[#444] text-white",
              footerActionLink:
                "text-purple-400 hover:text-purple-300",
              formButtonPrimary:
                "bg-purple-600 hover:bg-purple-700",
            },
          }}
        />
      </div>
    </div>
  );
}