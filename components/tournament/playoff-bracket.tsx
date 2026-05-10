"use client"

import type { Playoffs, PlayoffMatch } from "@/lib/tournament-types"

interface PlayoffBracketProps {
  playoffs: Playoffs
  teams: string[]
  onUpdate?: (match: "finals" | "third", s1: number | null, s2: number | null) => void
  readOnly?: boolean
}

function BracketMatch({
  label,
  match,
  teams,
  onUpdate,
  readOnly,
}: {
  label: string
  match: PlayoffMatch
  teams: string[]
  onUpdate?: (s1: number | null, s2: number | null) => void
  readOnly?: boolean
}) {
  const t1Name = teams[match.t1] || `チーム${match.t1 + 1}`
  const t2Name = teams[match.t2] || `チーム${match.t2 + 1}`
  const finished = match.s1 !== null && match.s2 !== null

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 w-full max-w-sm">
      <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">{label}</div>
      <div className="flex items-center justify-between gap-3">
        <span className={`flex-1 text-right text-sm font-semibold ${finished && match.s1! > match.s2! ? "text-yellow-400" : ""}`}>
          {t1Name}
        </span>
        <div className="flex items-center gap-1.5 font-bold">
          {readOnly || !onUpdate ? (
            <span className="text-slate-300 text-lg">
              {match.s1 ?? "-"} : {match.s2 ?? "-"}
            </span>
          ) : (
            <>
              <input
                type="number"
                min={0}
                max={99}
                value={match.s1 ?? ""}
                onChange={(e) => onUpdate(e.target.value === "" ? null : Number(e.target.value), match.s2)}
                className="w-12 rounded border border-slate-600 bg-slate-900 px-1 py-0.5 text-center text-sm"
              />
              <span className="text-slate-500">:</span>
              <input
                type="number"
                min={0}
                max={99}
                value={match.s2 ?? ""}
                onChange={(e) => onUpdate(match.s1, e.target.value === "" ? null : Number(e.target.value))}
                className="w-12 rounded border border-slate-600 bg-slate-900 px-1 py-0.5 text-center text-sm"
              />
            </>
          )}
        </div>
        <span className={`flex-1 text-sm font-semibold ${finished && match.s2! > match.s1! ? "text-yellow-400" : ""}`}>
          {t2Name}
        </span>
      </div>
    </div>
  )
}

export function PlayoffBracket({ playoffs, teams, onUpdate, readOnly = false }: PlayoffBracketProps) {
  return (
    <div className="flex flex-col gap-4 items-center">
      <BracketMatch
        label="決勝"
        match={playoffs.finals}
        teams={teams}
        onUpdate={onUpdate ? (s1, s2) => onUpdate("finals", s1, s2) : undefined}
        readOnly={readOnly}
      />
      <BracketMatch
        label="3位決定戦"
        match={playoffs.third}
        teams={teams}
        onUpdate={onUpdate ? (s1, s2) => onUpdate("third", s1, s2) : undefined}
        readOnly={readOnly}
      />
    </div>
  )
}
