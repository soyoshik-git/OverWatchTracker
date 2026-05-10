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
      <div className="flex min-h-screen items-center justify-center bg-[#e8e8e8]">
        <span className="text-2xl font-black uppercase tracking-widest text-[#888]" style={{ fontFamily: "var(--font-barlow)" }}>
          Loading...
        </span>
      </div>
    )
  }

  const standings = calcStandings(teams, matches)

  return (
    <div className="min-h-screen bg-[#e8e8e8]">
      {/* Header */}
      <header className="bg-[#1a1a1a] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#f4931a]" />
            <h1
              className="text-2xl font-black uppercase tracking-widest text-white"
              style={{ fontFamily: "var(--font-barlow)" }}
            >
              Overwatch Champions Series
            </h1>
          </div>
          <PhaseBadge phase={phase} />
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-8 px-4 space-y-10">
        {(phase === "group" || phase === "playoffs" || phase === "done") && (
          <section>
            <SectionTitle>Standings</SectionTitle>
            <StandingsTable standings={standings} />
          </section>
        )}

        {phase === "group" && matches.length > 0 && (
          <section>
            <SectionTitle>Matches</SectionTitle>
            <div>
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} teams={teams} readOnly />
              ))}
            </div>
          </section>
        )}

        {(phase === "playoffs" || phase === "done") && (
          <section>
            <SectionTitle>Playoffs</SectionTitle>
            <PlayoffBracket playoffs={playoffs} teams={teams} readOnly />
          </section>
        )}

        {phase === "setup" && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-16 h-1 bg-[#f4931a]" />
            <p className="text-xl font-black uppercase tracking-widest text-[#aaa]" style={{ fontFamily: "var(--font-barlow)" }}>
              Tournament Starting Soon
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-6 bg-[#f4931a]" />
      <h2
        className="text-base font-black uppercase tracking-widest text-[#444444]"
        style={{ fontFamily: "var(--font-barlow)" }}
      >
        {children}
      </h2>
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
