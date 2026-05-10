"use client"

import type { TeamStanding } from "@/lib/tournament-types"

interface StandingsTableProps {
  standings: TeamStanding[]
}

export function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <div className="rounded-lg border border-slate-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">チーム</th>
            <th className="px-4 py-2 text-center">W</th>
            <th className="px-4 py-2 text-center">L</th>
            <th className="px-4 py-2 text-center">±</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.index} className={i % 2 === 0 ? "bg-slate-900" : "bg-slate-800/50"}>
              <td className="px-4 py-2 text-slate-400">{i + 1}</td>
              <td className="px-4 py-2 font-medium">{s.name || `チーム${s.index + 1}`}</td>
              <td className="px-4 py-2 text-center text-green-400">{s.wins}</td>
              <td className="px-4 py-2 text-center text-red-400">{s.losses}</td>
              <td className={`px-4 py-2 text-center ${s.diff > 0 ? "text-green-400" : s.diff < 0 ? "text-red-400" : "text-slate-400"}`}>
                {s.diff > 0 ? `+${s.diff}` : s.diff}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
