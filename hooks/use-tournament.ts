"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { TournamentState, Phase, Match, PlayoffMatch } from "@/lib/tournament-types"

const initialState: TournamentState = {
  phase: "setup",
  teams: ["", "", "", "", ""],
  matches: [],
  playoffs: {
    finals: { t1: 0, t2: 1, s1: null, s2: null },
    third: { t1: 2, t2: 3, s1: null, s2: null },
  },
}

export interface TournamentActions {
  setPhase: (phase: Phase) => void
  setTeamName: (index: number, name: string) => void
  generateMatches: () => void
  updateMatch: (id: string, s1: number | null, s2: number | null) => void
  clearMatchScore: (id: string) => void
  updatePlayoff: (match: "finals" | "third", s1: number | null, s2: number | null) => void
  setPlayoffTeams: (finals: [number, number], third: [number, number]) => void
  goBack: () => void
  resetTournament: () => void
  refreshState: () => Promise<void>
  isLoading: boolean
}

async function fetchState(): Promise<TournamentState> {
  const res = await fetch("/api/tournament")
  if (!res.ok) throw new Error("Failed to fetch state")
  return res.json()
}

async function saveState(state: TournamentState): Promise<void> {
  const password = sessionStorage.getItem("admin-password")
  const res = await fetch("/api/tournament", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${password}`,
    },
    body: JSON.stringify(state),
  })
  if (!res.ok) throw new Error("Failed to save state")
}

function generateRoundRobin(teamCount: number): Match[] {
  const matches: Match[] = []
  for (let i = 0; i < teamCount; i++) {
    for (let j = i + 1; j < teamCount; j++) {
      matches.push({ id: `${i}-${j}`, t1: i, t2: j, s1: null, s2: null })
    }
  }
  return matches
}

export function useTournament(isAdmin: boolean = false): TournamentState & TournamentActions {
  const [state, setState] = useState<TournamentState>(initialState)
  const [isLoading, setIsLoading] = useState(true)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    fetchState()
      .then((s) => { if (isMounted.current) setState(s) })
      .catch(console.error)
      .finally(() => { if (isMounted.current) setIsLoading(false) })
    return () => { isMounted.current = false }
  }, [])

  const pendingSave = useRef(false)
  useEffect(() => {
    if (!isAdmin || isLoading) return
    if (pendingSave.current) return
    pendingSave.current = true
    const timer = setTimeout(() => {
      saveState(state).catch(console.error).finally(() => { pendingSave.current = false })
    }, 300)
    return () => { clearTimeout(timer); pendingSave.current = false }
  }, [state, isAdmin, isLoading])

  const setPhase = useCallback((phase: Phase) => {
    setState((prev) => ({ ...prev, phase }))
  }, [])

  const setTeamName = useCallback((index: number, name: string) => {
    setState((prev) => {
      const teams = [...prev.teams]
      teams[index] = name
      return { ...prev, teams }
    })
  }, [])

  const generateMatches = useCallback(() => {
    setState((prev) => ({
      ...prev,
      matches: generateRoundRobin(prev.teams.length),
    }))
  }, [])

  const updateMatch = useCallback((id: string, s1: number | null, s2: number | null) => {
    setState((prev) => ({
      ...prev,
      matches: prev.matches.map((m) => (m.id === id ? { ...m, s1, s2 } : m)),
    }))
  }, [])

  const clearMatchScore = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      matches: prev.matches.map((m) => (m.id === id ? { ...m, s1: null, s2: null } : m)),
    }))
  }, [])

  const updatePlayoff = useCallback((match: "finals" | "third", s1: number | null, s2: number | null) => {
    setState((prev) => ({
      ...prev,
      playoffs: {
        ...prev.playoffs,
        [match]: { ...prev.playoffs[match], s1, s2 },
      },
    }))
  }, [])

  const setPlayoffTeams = useCallback((finals: [number, number], third: [number, number]) => {
    setState((prev) => ({
      ...prev,
      playoffs: {
        finals: { t1: finals[0], t2: finals[1], s1: null, s2: null },
        third: { t1: third[0], t2: third[1], s1: null, s2: null },
      },
    }))
  }, [])

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.phase === "group") {
        return { ...prev, phase: "setup", matches: [] }
      }
      if (prev.phase === "playoffs") {
        return { ...prev, phase: "group" }
      }
      if (prev.phase === "done") {
        return { ...prev, phase: "playoffs" }
      }
      return prev
    })
  }, [])

  const resetTournament = useCallback(() => {
    setState(initialState)
  }, [])

  const refreshState = useCallback(async () => {
    const s = await fetchState()
    setState(s)
  }, [])

  return {
    ...state,
    setPhase,
    setTeamName,
    generateMatches,
    updateMatch,
    clearMatchScore,
    updatePlayoff,
    setPlayoffTeams,
    goBack,
    resetTournament,
    refreshState,
    isLoading,
  }
}
