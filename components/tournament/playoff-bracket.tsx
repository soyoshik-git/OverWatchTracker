"use client"

import type { Playoffs, PlayoffMatch } from "@/lib/tournament-types"

const JP_RE = /[぀-ヿ一-鿿]/

function TeamName({ name, active }: { name: string; active: boolean }) {
  const isJP = JP_RE.test(name)
  return (
    <span
      className={`text-2xl font-black tracking-wide ${active ? "text-[#1a1a1a]" : "text-[#777]"}`}
      style={{
        fontFamily: "var(--font-barlow)",
        ...(isJP ? {
          display: "inline-block",
          transform: "scaleX(0.82)",
          transformOrigin: "left center",
        } : {}),
      }}
    >
      {name}
    </span>
  )
}

interface PlayoffBracketProps {
  playoffs: Playoffs
  teams: string[]
  onUpdate?: (match: "finals" | "third", s1: number | null, s2: number | null) => void
  readOnly?: boolean
}

function BracketMatch({
  label, match, teams, onUpdate, readOnly,
}: {
  label: string
  match: PlayoffMatch
  teams: string[]
  onUpdate?: (s1: number | null, s2: number | null) => void
  readOnly?: boolean
}) {
  const t1Name = teams[match.t1] || `TEAM ${match.t1 + 1}`
  const t2Name = teams[match.t2] || `TEAM ${match.t2 + 1}`
  const finished = match.s1 !== null && match.s2 !== null
  const t1Win = finished && match.s1! > match.s2!
  const t2Win = finished && match.s2! > match.s1!

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-[#1a1a1a] px-4 py-1.5 flex items-center gap-3">
        <div className="w-1 h-4 bg-[#f4931a]" />
        <span className="text-sm font-black uppercase tracking-widest text-white"
          style={{ fontFamily: "var(--font-barlow)" }}>
          {label}
        </span>
      </div>

      <div>
        {/* Team 1 — 常に border-l-4 確保 */}
        <div className={`flex items-center justify-between px-4 py-3 border-b border-[#cccccc] border-l-4 ${t1Win ? "bg-[#e0e0e0] border-l-[#f4931a]" : "bg-[#ececec] border-l-transparent"}`}>
          <TeamName name={t1Name} active={!finished || t1Win} />
          {readOnly || !onUpdate ? (
            <span className={`text-2xl font-black w-8 text-center ${t1Win ? "text-[#f4931a]" : "text-[#1a1a1a]"}`}>
              {match.s1 ?? "-"}
            </span>
          ) : (
            <input type="number" min={0} max={99} value={match.s1 ?? ""}
              onChange={(e) => onUpdate(e.target.value === "" ? null : Number(e.target.value), match.s2)}
              className="w-12 bg-[#ddd] text-[#1a1a1a] text-center text-xl font-black rounded border border-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#f4931a]"
            />
          )}
        </div>

        {/* Team 2 — 常に border-l-4 確保 */}
        <div className={`flex items-center justify-between px-4 py-3 border-l-4 ${t2Win ? "bg-[#e0e0e0] border-l-[#f4931a]" : "bg-[#e8e8e8] border-l-transparent"}`}>
          <TeamName name={t2Name} active={!finished || t2Win} />
          {readOnly || !onUpdate ? (
            <span className={`text-2xl font-black w-8 text-center ${t2Win ? "text-[#f4931a]" : "text-[#1a1a1a]"}`}>
              {match.s2 ?? "-"}
            </span>
          ) : (
            <input type="number" min={0} max={99} value={match.s2 ?? ""}
              onChange={(e) => onUpdate(match.s1, e.target.value === "" ? null : Number(e.target.value))}
              className="w-12 bg-[#ddd] text-[#1a1a1a] text-center text-xl font-black rounded border border-[#cccccc] focus:outline-none focus:ring-1 focus:ring-[#f4931a]"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function PlayoffBracket({ playoffs, teams, onUpdate, readOnly = false }: PlayoffBracketProps) {
  return (
    <div className="flex flex-col gap-6 items-center">
      <BracketMatch label="Grand Finals" match={playoffs.finals} teams={teams}
        onUpdate={onUpdate ? (s1, s2) => onUpdate("finals", s1, s2) : undefined}
        readOnly={readOnly} />
      <BracketMatch label="3rd Place Match" match={playoffs.third} teams={teams}
        onUpdate={onUpdate ? (s1, s2) => onUpdate("third", s1, s2) : undefined}
        readOnly={readOnly} />
    </div>
  )
}
