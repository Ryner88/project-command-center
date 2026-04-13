import { useEffect, useState } from "react";

import type { DailyBriefing } from "@/types/briefing";

export function useBriefing() {
  const [data, setData] = useState<DailyBriefing | null>(null);

  useEffect(() => {
    void fetch("/api/briefing")
      .then((response) => response.json())
      .then((payload: DailyBriefing) => setData(payload));
  }, []);

  return data;
}
