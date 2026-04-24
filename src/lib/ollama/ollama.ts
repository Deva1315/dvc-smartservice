type OllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  images?: string[];
};

type OllamaChatRequest = {
  model: string;
  messages: OllamaChatMessage[];
  stream?: boolean;
};

type OllamaChatResponse = {
  model: string;
  created_at: string;
  message: {
    role: "assistant";
    content: string;
  };
  done: boolean;
};

export async function chatWithOllama(payload: OllamaChatRequest) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Ollama request failed (${response.status}): ${errorText || "Unknown error"}`
    );
  }

  const data = (await response.json()) as OllamaChatResponse;
  return data;
}