import { NextResponse } from "next/server";
import { DEPLOYMENT_SCRIPT } from "@/data/deployment-script";

// Pomocnicza funkcja "poczekaj X milisekund" - symuluje realny czas wdrożenia
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  const encoder = new TextEncoder();

  // ReadableStream pozwala wysyłać dane do przeglądarki kawałek po kawałku,
  // zamiast czekać, aż CAŁA odpowiedź będzie gotowa. To jest dokładnie
  // ten mechanizm, na którym oparte są streamowane odpowiedzi czatów AI.
  const stream = new ReadableStream({
    async start(controller) {
      for (const step of DEPLOYMENT_SCRIPT) {
        const entry = {
          level: step.level,
          message: step.message,
          nodeId: step.nodeId,
          progress: step.progress,
          timestamp: Date.now(),
        };

        // Format Server-Sent Events: każda wiadomość zaczyna się od "data: "
        // i kończy podwójnym znakiem nowej linii
        const sseChunk = `data: ${JSON.stringify(entry)}\n\n`;
        controller.enqueue(encoder.encode(sseChunk));

        await sleep(step.delayAfterMs);
      }

      // Sygnał końca strumienia
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}