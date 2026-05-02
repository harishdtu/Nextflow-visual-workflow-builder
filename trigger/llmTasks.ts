import { task } from "@trigger.dev/sdk/v3";

export const llmTask = task({
  id: "run-llm",
  run: async (payload: { userMessage: string }) => {
    console.log("TASK HIT:", payload);

    return {
      output: "WORKING: " + payload.userMessage,
    };
  },
});