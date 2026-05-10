export type Phase = 'setup' | 'group' | 'playoffs' | 'done'

export interface Match {
  id: string
  t1: number
  t2: number
  s1: number | null
  s2: number | null
}

export interface PlayoffMatch {
  t1: number
  t2: number
  s1: number | null
  s2: number | null
}

export interface Playoffs {
  finals: PlayoffMatch
  third: PlayoffMatch
}

export interface TournamentState {
  phase: Phase
  teams: string[]
  matches: Match[]
  playoffs: Playoffs
}

export interface TeamStanding {
  index: number
  name: string
  wins: number
  losses: number
  diff: number
}
