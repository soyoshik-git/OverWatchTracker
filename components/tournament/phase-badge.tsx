"use client"

import type { Phase } from "@/lib/tournament-types"

const labels: Record<Phase, string> = {
  setup: "準備中",
  group: "グループステージ",
  playoffs: "プレーオフ",
  done: "終了",
}

const colors: Record<Phase, string> = {
  setup: "bg-slate-700 text-slate-300",
  group: "bg-blue-700 text-blue-100",
  playoffs: "bg-purple-700 text-purple-100",
  done: "bg-green-700 text-green-100",
}

interface PhaseBadgeProps {
  phase: Phase
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors[phase]}`}>
      {labels[phase]}
    </span>
  )
}
