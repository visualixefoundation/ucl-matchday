"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  return (
    <button
      className="refresh-btn"
      onClick={() => {
        startTransition(() => {
          router.refresh();
          setLastRefreshed(
            new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          );
        });
      }}
    >
      {isPending ? "Refreshing…" : lastRefreshed ? `Updated ${lastRefreshed}` : "Refresh scores"}
    </button>
  );
}
