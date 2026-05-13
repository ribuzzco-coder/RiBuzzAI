import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

/**
 * Wrapper de Claude API con:
 *  - retry exponencial (1s, 2s, 3s)
 *  - parseo y validación JSON
 *  - logging del raw para auditoría (devuelve { parsed, raw })
 */
export async function callClaude<T = unknown>(
  systemPrompt: string,
  userContent: string,
  options: { maxRetries?: number; maxTokens?: number } = {}
): Promise<{ parsed: T; raw: string }> {
  const { maxRetries = 2, maxTokens = 4096 } = options;
  let lastErr: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }]
      });

      const block = response.content[0];
      const text = block && block.type === "text" ? block.text : "";

      // Saneamiento: extraer el primer bloque JSON {...} para tolerar
      // cualquier prefijo textual ocasional.
      const jsonMatch = text.match(/\{[\s\S]*\}$/m);
      const candidate = jsonMatch ? jsonMatch[0] : text;
      const parsed = JSON.parse(candidate) as T;

      return { parsed, raw: text };
    } catch (err) {
      lastErr = err;
      if (attempt === maxRetries) break;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  throw new Error(
    `Claude API falló tras ${maxRetries + 1} intentos: ${
      lastErr instanceof Error ? lastErr.message : "unknown"
    }`
  );
}
