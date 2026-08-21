import { generateAgentChatResponse } from "./server/gemini.js";

async function main() {
  try {
    const res = await generateAgentChatResponse("hello", undefined, [], "aiwibcrafter");
    console.log("Response:", res);
  } catch (err) {
    console.error("Fatal:", err);
  }
}
main();
