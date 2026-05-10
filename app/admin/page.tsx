"use client"

import { useState, useEffect } from "react"
import { TournamentProvider, useTournamentContext } from "@/contexts/tournament-context"
import { StandingsTable } from "@/components/tournament/standings-table"
import { MatchCard } from "@/components/tournament/match-card"
import { PlayoffBracket } from "@/components/tournament/playoff-bracket"
import { PhaseBadge } from "@/components/tournament/phase-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calcStandings } from "@/lib/utils"

function AuthModal({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        sessionStorage.setItem("admin-password", password)
        onSuccess()
      } else {
        setError("パスワードが正しくありません")
      }
    } catch {
      setError("通信エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle>管理者認証</DialogTitle>
          <DialogDescription className="text-slate-400">
            管理画面にアクセスするにはパスワードを入力してください
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800 border-slate-600 text-slate-100"
              autoFocus
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" disabled={loading || !password} className="w-full">
            {loading ? "確認中..." : "ログイン"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AdminContent() {
  const {
    phase, teams, matches, playoffs, isLoading,
    setPhase, setTeamName, generateMatches, updateMatch, updatePlayoff, setPlayoffTeams,
  } = useTournamentContext()

  const standings = calcStandings(teams, matches)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        読み込み中...
      </div>
    )
  }

  const top4 = standings.slice(0, 4)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">管理画面</h1>
          <PhaseBadge phase={phase} />
        </div>

        {/* Setup Phase */}
        {phase === "setup" && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-300">チーム設定</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {teams.map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-400 w-6">{i + 1}.</span>
                  <Input
                    value={name}
                    onChange={(e) => setTeamName(i, e.target.value)}
                    placeholder={`チーム${i + 1}`}
                    className="bg-slate-800 border-slate-600 text-slate-100"
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={() => { generateMatches(); setPhase("group") }}
              disabled={teams.filter(Boolean).length < 2}
            >
              グループステージ開始
            </Button>
          </section>
        )}

        {/* Group Phase */}
        {phase === "group" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-300">グループステージ</h2>
              <Button
                variant="outline"
                onClick={() => {
                  if (top4.length >= 4) {
                    setPlayoffTeams(
                      [top4[0].index, top4[1].index],
                      [top4[2].index, top4[3].index]
                    )
                  }
                  setPhase("playoffs")
                }}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                プレーオフへ進む
              </Button>
            </div>
            <StandingsTable standings={standings} />
            <div className="space-y-2">
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} teams={teams} onUpdate={updateMatch} />
              ))}
            </div>
          </section>
        )}

        {/* Playoffs Phase */}
        {(phase === "playoffs" || phase === "done") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-300">プレーオフ</h2>
              {phase === "playoffs" && (
                <Button
                  variant="outline"
                  onClick={() => setPhase("done")}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  終了
                </Button>
              )}
            </div>
            <PlayoffBracket
              playoffs={playoffs}
              teams={teams}
              onUpdate={phase === "playoffs" ? updatePlayoff : undefined}
              readOnly={phase === "done"}
            />
          </section>
        )}

        {phase === "done" && (
          <div className="text-center text-slate-400 py-4">
            トーナメント終了
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem("admin-password")
    if (!stored) { setChecking(false); return }

    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: stored }),
    })
      .then((res) => { if (res.ok) setAuthenticated(true) })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        確認中...
      </div>
    )
  }

  if (!authenticated) {
    return <AuthModal onSuccess={() => setAuthenticated(true)} />
  }

  return (
    <TournamentProvider isAdmin={true}>
      <AdminContent />
    </TournamentProvider>
  )
}
