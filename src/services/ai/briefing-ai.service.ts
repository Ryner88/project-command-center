import { getOpenAIClient } from "@/lib/openai";
import { dailyBriefingPrompt } from "@/prompts/daily-briefing";
import type { BriefingItem, BriefingSummary } from "@/types/briefing";

export async function generateBriefingSummary(items: BriefingItem[]): Promise<BriefingSummary> {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackSummary(items);
  }

  try {
    const openai = getOpenAIClient();

    if (!openai) {
      return buildFallbackSummary(items);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: dailyBriefingPrompt.trim()
        },
        {
          role: "user",
          content: JSON.stringify(items)
        }
      ]
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return buildFallbackSummary(items);
    }

    const parsed = JSON.parse(content) as { title?: string; body?: string };

    return {
      title:
        parsed.title ?? "Your day centers on live client conversations and proposal follow-up.",
      body: parsed.body ?? buildFallbackSummary(items).body
    };
  } catch {
    return buildFallbackSummary(items);
  }
}

function buildFallbackSummary(items: BriefingItem[]): BriefingSummary {
  const actionCount = items.filter((item) => item.requiresAction).length;
  const meetingCount = items.filter((item) => item.source === "calendar").length;

  return {
    title: "Your day centers on live client conversations and proposal follow-up.",
    body: `${dailyBriefingPrompt.trim()} You have ${meetingCount} meeting(s) on the calendar and ${actionCount} item(s) that should turn into proposal work today.`
  };
}
