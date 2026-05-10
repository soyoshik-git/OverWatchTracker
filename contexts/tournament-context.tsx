"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useTournament, type TournamentActions } from "@/hooks/use-tournament"
import type { TournamentState } from "@/lib/tournament-types"

type TournamentContextValue = TournamentState & TournamentActions

const TournamentContext = createContext<TournamentContextValue | null>(null)

export function TournamentProvider({
  children,
  isAdmin = false,
}: {
  children: ReactNode
  isAdmin?: boolean
}) {
  const tournament = useTournament(isAdmin)
  return (
    <TournamentContext.Provider value={tournament}>
      {children}
    </TournamentContext.Provider>
  )
}

export function useTournamentContext() {
  const ctx = useContext(TournamentContext)
  if (!ctx) throw new Error("useTournamentContext must be used within TournamentProvider")
  return ctx
}
