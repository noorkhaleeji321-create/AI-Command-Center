import { fetchEnvSecrets } from "./server/supabaseAdmin.js";
async function main() {
  const secrets = await fetchEnvSecrets();
  const gemini = secrets.filter(s => s.key_name === "GEMINI_API_KEY");
  console.log(gemini);
}
main();
