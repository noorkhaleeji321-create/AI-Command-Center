import { getGeminiClient } from "./server/gemini.js";

async function main() {
  const client = await getGeminiClient();
  const response = await client.models.list();
  const models = [];
  for await (const m of response) {
    models.push(m.name);
  }
  console.log("Models:", models);
}
main();
