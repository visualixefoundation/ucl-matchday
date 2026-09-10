"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Kicking off";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (hours > 0) return `${hours}h ${pad(minutes)}m`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

export default function KickoffCountdown({
  targetIso,
  label
}: {
  targetIso: string;
  label: string;
}) {
  const [remaining, setRemaining] = useState<string>("");

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    const tick = () => setRemaining(formatRemaining(target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!remaining) return null;

  return (
    <div className="countdown">
      <span className="countdown__label">Next kickoff — {label}</span>
      <span className="countdown__time">{remaining}</span>
    </div>
  );
}
