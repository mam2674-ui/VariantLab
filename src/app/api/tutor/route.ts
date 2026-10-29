import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { diagrams, viruses } from "@/lib/data";
import { glossary } from "@/data/glossary";
import { buildPassages, search } from "@/lib/retrieval";
import { SYSTEM_PROMPT, TutorOutput, scopeCheck, userPrompt, validateCitations, type TutorResponse } from "@/lib/tutor";

// Server-only: the key is read here and never sent to the browser.
const MODEL = process.env.TUTOR_MODEL ?? "claude-opus-5-5";
const passages = buildPassages(viruses, diagrams, glossary);

const Body = z.object({ question: z.string().trim().min(3).max(500), simple: z.boolean().default(false) });

// Basic per-process rate limit to protect a local key from runaway use.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Ask a question between 3 and 500 characters." }, { status: 400 });
  }

  const retrieved = search(passages, body.question, viruses, 6);
  const out = (r: TutorResponse) => Response.json(r);

  const outOfScope = scopeCheck(body.question);
  if (outOfScope) return out({ mode: "declined", message: outOfScope, passages: [] });

  if (!process.env.ANTHROPIC_API_KEY) return out({ mode: "curated", reason: "no_key", passages: retrieved });
  if (!retrieved.length)
    return out({ mode: "declined", message: "The atlas's curated sources don't cover this question, so the tutor won't guess. Try asking about structure, size, genomes, classification or replication of the viruses in the atlas.", passages: [] });
  if (limited(req.headers.get("x-forwarded-for") ?? "local")) return Response.json({ error: "Too many questions in a minute; try again shortly." }, { status: 429 });

  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: "low", format: zodOutputFormat(TutorOutput) },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt(body.question, retrieved, body.simple) }],
    });
    if (response.stop_reason === "refusal") return out({ mode: "curated", reason: "refusal", passages: retrieved });

    // Re-validate: the SDK parse is a first check, then our own schema and citation rules.
    const parsed = TutorOutput.safeParse(response.parsed_output);
    if (!parsed.success) return out({ mode: "curated", reason: "invalid_output", passages: retrieved });
    const check = validateCitations(parsed.data, retrieved.map((p) => p.id));
    if (!check.ok) return out({ mode: "curated", reason: "invalid_output", passages: retrieved });
    return out({ mode: "generated", output: parsed.data, passages: retrieved });
  } catch (err) {
    console.error("tutor: model call failed", err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
    return out({ mode: "curated", reason: "model_error", passages: retrieved });
  }
}
