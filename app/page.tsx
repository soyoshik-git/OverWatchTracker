"use client"

import { useEffect } from "react"
import { TournamentProvider, useTournamentContext } from "@/contexts/tournament-context"
import { StandingsTable } from "@/components/tournament/standings-table"
import { MatchCard } from "@/components/tournament/match-card"
import { PlayoffBracket } from "@/components/tournament/playoff-bracket"
import { PhaseBadge } from "@/components/tournament/phase-badge"
import { calcStandings } from "@/lib/utils"

function ViewerContent() {
  const { phase, teams, matches, playoffs, isLoading, refreshState } = useTournamentContext()

  useEffect(() => {
    const interval = setInterval(() => {
      refreshState().catch(() => {})
    }, 5000)
    return () => clearInterval(interval)
  }, [refreshState])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        読み込み中...
      </div>
    )
  }

  const standings = calcStandings(teams, matches)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">OW2 トーナメント</h1>
          <PhaseBadge phase={phase} />
        </div>

        {(phase === "group" || phase === "playoffs" || phase === "done") && (
          <section>
            <h2 className="text-lg font-semibold text-slate-300 mb-3">順位表</h2>
            <StandingsTable standings={standings} />
          </section>
        )}

        {phase === "group" && (
          <section>
            <h2 className="text-lg font-semibold text-slate-300 mb-3">グループステージ</h2>
            <div className="space-y-2">
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} teams={teams} readOnly />
              ))}
            </div>
          </section>
        )}

        {(phase === "playoffs" || phase === "done") && (
          <section>
            <h2 className="text-lg font-semibold text-slate-300 mb-3">プレーオフ</h2>
            <PlayoffBracket playoffs={playoffs} teams={teams} readOnly />
          </section>
        )}

        {phase === "setup" && (
          <div className="text-center text-slate-500 py-16">
            トーナメント開始をお待ちください
          </div>
        )}
      </div>
    </div>
  )
}

export default function ViewerPage() {
  return (
    <TournamentProvider isAdmin={false}>
      <ViewerContent />
    </TournamentProvider>
  )
}
