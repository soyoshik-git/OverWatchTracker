"use client"

import type { TeamStanding } from "@/lib/tournament-types"

const JP_RE = /[぀-ヿ一-鿿]/

interface StandingsTableProps {
  standings: TeamStanding[]
  playoffCutoff?: number
}

export function StandingsTable({ standings, playoffCutoff = 4 }: StandingsTableProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center px-4 pb-2 text-xs font-800 uppercase tracking-widest text-[#888]">
        <span className="w-10" />
        <span className="flex-1" />
        <span className="w-12 text-center">W</span>
        <span className="w-12 text-center">L</span>
        <span className="w-16 text-center">+/-</span>
      </div>

      {standings.map((s, i) => {
        const isPlayoffCutoff = i === playoffCutoff - 1
        const belowCutoff = i >= playoffCutoff

        return (
          <div key={s.index}>
            <div
              className={`flex items-center px-4 py-3 transition-colors ${
                belowCutoff
                  ? "opacity-70"
                  : "border-l-4 border-[#f4931a]"
              } ${i % 2 === 0 ? "bg-[#ececec]" : "bg-[#e4e4e4]"}`}
            >
              {/* Rank */}
              <span
                className="w-10 text-3xl font-black italic leading-none text-[#1a1a1a]"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                {i + 1}
              </span>

              {/* Team name */}
              <span className="flex-1 overflow-hidden">
                {(() => {
                  const name = s.name || `TEAM ${s.index + 1}`
                  const isJP = JP_RE.test(name)
                  return (
                    <span
                      className="text-2xl font-black tracking-wide text-[#1a1a1a]"
                      style={{
                        fontFamily: "var(--font-barlow)",
                        ...(isJP ? { display: "inline-block", transform: "scaleX(0.82)", transformOrigin: "left center" } : {}),
                      }}
                    >
                      {name}
                    </span>
                  )
                })()}
              </span>

              {/* W */}
              <span className="w-12 text-center text-2xl font-bold text-[#1a1a1a]">
                {s.wins}
              </span>

              {/* L */}
              <span className="w-12 text-center text-2xl font-bold text-[#1a1a1a]">
                {s.losses}
              </span>

              {/* +/- */}
              <span
                className={`w-16 text-center text-2xl font-black ${
                  s.diff > 0
                    ? "text-emerald-600"
                    : s.diff < 0
                    ? "text-red-600"
                    : "text-[#888]"
                }`}
              >
                {s.diff > 0 ? `+${s.diff}` : s.diff}
              </span>
            </div>

            {/* Cutoff divider */}
            {isPlayoffCutoff && (
              <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1a1a]">
                <div className="flex-1 h-px bg-[#444]" />
                <span className="text-xs font-black uppercase tracking-widest text-[#888]">
                  Advance to Playoffs
                </span>
                <div className="flex-1 h-px bg-[#444]" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
