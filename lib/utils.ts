import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Match, TeamStanding } from "@/lib/tournament-types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcStandings(teams: string[], matches: Match[]): TeamStanding[] {
  const standings: TeamStanding[] = teams.map((name, index) => ({
    index,
    name,
    wins: 0,
    losses: 0,
    diff: 0,
  }))

  for (const m of matches) {
    if (m.s1 === null || m.s2 === null) continue
    const diff = m.s1 - m.s2
    if (diff > 0) {
      standings[m.t1].wins++
      standings[m.t2].losses++
    } else if (diff < 0) {
      standings[m.t2].wins++
      standings[m.t1].losses++
    }
    standings[m.t1].diff += diff
    standings[m.t2].diff -= diff
  }

  return standings.sort((a, b) => b.wins - a.wins || b.diff - a.diff)
}
