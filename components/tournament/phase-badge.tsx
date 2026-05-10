"use client"

import type { Phase } from "@/lib/tournament-types"

const labels: Record<Phase, string> = {
  setup: "SETUP",
  group: "GROUP STAGE",
  playoffs: "PLAYOFFS",
  done: "FINAL",
}

const colors: Record<Phase, string> = {
  setup: "bg-[#555] text-white",
  group: "bg-[#f4931a] text-white",
  playoffs: "bg-[#1a1a1a] text-[#f4931a]",
  done: "bg-emerald-700 text-white",
}

interface PhaseBadgeProps {
  phase: Phase
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-4 py-1 text-sm font-black uppercase tracking-widest ${colors[phase]}`}
      style={{ fontFamily: "var(--font-barlow)" }}
    >
      {labels[phase]}
    </span>
  )
}
