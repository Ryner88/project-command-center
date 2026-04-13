import { useEffect, useState } from "react";

import type { Proposal } from "@/types/proposal";

export function useProposals() {
  const [data, setData] = useState<Proposal[]>([]);

  useEffect(() => {
    void fetch("/api/proposals")
      .then((response) => response.json())
      .then((payload: { data: Proposal[] }) => setData(payload.data));
  }, []);

  return data;
}
