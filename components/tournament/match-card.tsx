"use client"

import type { Match } from "@/lib/tournament-types"

interface MatchCardProps {
  match: Match
  teams: string[]
  onUpdate?: (id: string, s1: number | null, s2: number | null) => void
  readOnly?: boolean
}

export function MatchCard({ match, teams, onUpdate, readOnly = false }: MatchCardProps) {
  const t1Name = teams[match.t1] || `チーム${match.t1 + 1}`
  const t2Name = teams[match.t2] || `チーム${match.t2 + 1}`
  const finished = match.s1 !== null && match.s2 !== null

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <div className="flex items-center justify-between gap-4">
        <span className={`flex-1 text-right font-semibold ${finished && match.s1! > match.s2! ? "text-yellow-400" : ""}`}>
          {t1Name}
        </span>
        <div className="flex items-center gap-2 text-lg font-bold">
          {readOnly || !onUpdate ? (
            <span className="text-slate-300">
              {match.s1 ?? "-"} : {match.s2 ?? "-"}
            </span>
          ) : (
            <>
              <input
                type="number"
                min={0}
                max={99}
                value={match.s1 ?? ""}
                onChange={(e) => onUpdate(match.id, e.target.value === "" ? null : Number(e.target.value), match.s2)}
                className="w-12 rounded border border-slate-600 bg-slate-900 px-1 py-0.5 text-center text-sm"
              />
              <span className="text-slate-500">:</span>
              <input
                type="number"
                min={0}
                max={99}
                value={match.s2 ?? ""}
                onChange={(e) => onUpdate(match.id, match.s1, e.target.value === "" ? null : Number(e.target.value))}
                className="w-12 rounded border border-slate-600 bg-slate-900 px-1 py-0.5 text-center text-sm"
              />
            </>
          )}
        </div>
        <span className={`flex-1 font-semibold ${finished && match.s2! > match.s1! ? "text-yellow-400" : ""}`}>
          {t2Name}
        </span>
      </div>
    </div>
  )
}
