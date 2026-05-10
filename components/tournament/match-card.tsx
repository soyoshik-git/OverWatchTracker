"use client"

import type { Match } from "@/lib/tournament-types"

interface MatchCardProps {
  match: Match
  teams: string[]
  onUpdate?: (id: string, s1: number | null, s2: number | null) => void
  onClearScore?: (id: string) => void
  readOnly?: boolean
}

export function MatchCard({ match, teams, onUpdate, onClearScore, readOnly = false }: MatchCardProps) {
  const t1Name = (teams[match.t1] || `TEAM ${match.t1 + 1}`).toUpperCase()
  const t2Name = (teams[match.t2] || `TEAM ${match.t2 + 1}`).toUpperCase()
  const finished = match.s1 !== null && match.s2 !== null
  const t1Win = finished && match.s1! > match.s2!
  const t2Win = finished && match.s2! > match.s1!
  const canClear = !readOnly && onClearScore && finished

  return (
    <div className="flex items-center bg-[#ececec] border-b border-[#cccccc]">
      {/* Team 1 */}
      <div className={`flex-1 flex justify-end items-center gap-3 px-4 py-3 ${t1Win ? "border-l-4 border-[#f4931a]" : ""}`}>
        <span
          className={`text-xl font-black uppercase tracking-wide ${t1Win ? "text-[#1a1a1a]" : "text-[#777]"}`}
          style={{ fontFamily: "var(--font-barlow)" }}
        >
          {t1Name}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[#1a1a1a] min-w-[140px] justify-center relative">
        {readOnly || !onUpdate ? (
          <>
            <span className={`text-2xl font-black w-8 text-center ${t1Win ? "text-[#f4931a]" : "text-white"}`}>
              {match.s1 ?? "-"}
            </span>
            <span className="text-[#555] font-bold mx-1">:</span>
            <span className={`text-2xl font-black w-8 text-center ${t2Win ? "text-[#f4931a]" : "text-white"}`}>
              {match.s2 ?? "-"}
            </span>
          </>
        ) : (
          <>
            <input
              type="number"
              min={0}
              max={99}
              value={match.s1 ?? ""}
              onChange={(e) => onUpdate(match.id, e.target.value === "" ? null : Number(e.target.value), match.s2)}
              className="w-10 bg-[#333] text-white text-center text-xl font-black rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#f4931a]"
            />
            <span className="text-[#555] font-bold mx-1">:</span>
            <input
              type="number"
              min={0}
              max={99}
              value={match.s2 ?? ""}
              onChange={(e) => onUpdate(match.id, match.s1, e.target.value === "" ? null : Number(e.target.value))}
              className="w-10 bg-[#333] text-white text-center text-xl font-black rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#f4931a]"
            />
            {canClear && (
              <button
                onClick={() => onClearScore(match.id)}
                title="スコアをクリア"
                className="ml-1 text-[#666] hover:text-red-400 text-lg font-black leading-none transition-colors"
              >
                ×
              </button>
            )}
          </>
        )}
      </div>

      {/* Team 2 */}
      <div className={`flex-1 flex justify-start items-center gap-3 px-4 py-3 ${t2Win ? "border-r-4 border-[#f4931a]" : ""}`}>
        <span
          className={`text-xl font-black uppercase tracking-wide ${t2Win ? "text-[#1a1a1a]" : "text-[#777]"}`}
          style={{ fontFamily: "var(--font-barlow)" }}
        >
          {t2Name}
        </span>
      </div>
    </div>
  )
}
