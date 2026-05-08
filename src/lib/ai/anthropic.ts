/**
 * Client Anthropic pour la génération IA de boutiques.
 * Utilise l'API Messages directement (pas le SDK officiel pour rester léger).
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-6";

export interface AnthropicMessageOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AnthropicResponse {
  success: boolean;
  text?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Appelle Claude avec un prompt utilisateur et retourne la réponse texte.
 */
export async function callClaude(
  userMessage: string,
  options: AnthropicMessageOptions = {}
): Promise<AnthropicResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    console.error("[anthropic] ANTHROPIC_API_KEY missing");
    return { success: false, error: "API key missing" };
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature ?? 0.7,
        system: options.system,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[anthropic] API error:", response.status, errText);
      return {
        success: false,
        error: `API error ${response.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = await response.json();

    // Extraire le texte de la réponse
    const text = data.content?.[0]?.text;
    if (!text) {
      console.error("[anthropic] No text in response:", JSON.stringify(data).slice(0, 500));
      return { success: false, error: "No text in response" };
    }

    return {
      success: true,
      text,
      usage: {
        inputTokens: data.usage?.input_tokens || 0,
        outputTokens: data.usage?.output_tokens || 0,
      },
    };
  } catch (err) {
    console.error("[anthropic] Exception:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
