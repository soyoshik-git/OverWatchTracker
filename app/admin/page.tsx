"use client"

import { useState, useEffect } from "react"
import { TournamentProvider, useTournamentContext } from "@/contexts/tournament-context"
import { StandingsTable } from "@/components/tournament/standings-table"
import { MatchCard } from "@/components/tournament/match-card"
import { PlayoffBracket } from "@/components/tournament/playoff-bracket"
import { PhaseBadge } from "@/components/tournament/phase-badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { calcStandings } from "@/lib/utils"
import type { Phase } from "@/lib/tournament-types"

// ─── 共通UIパーツ ────────────────────────────────────────────

function OWButton({
  children, onClick, disabled, variant = "primary", className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "outline" | "danger"
  className?: string
}) {
  const base = "px-5 py-2 text-sm font-black uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
  const styles =
    variant === "primary" ? "bg-[#f4931a] text-white hover:bg-orange-500"
    : variant === "danger" ? "bg-red-700 text-white hover:bg-red-600"
    : "border border-[#cccccc] text-[#444444] hover:bg-[#ddd]"
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`${base} ${styles} ${className}`}
      style={{ fontFamily: "var(--font-barlow)" }}>
      {children}
    </button>
  )
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-[#f4931a]" />
        <h2 className="text-base font-black uppercase tracking-widest text-[#444444]"
          style={{ fontFamily: "var(--font-barlow)" }}>
          {children}
        </h2>
      </div>
      {action}
    </div>
  )
}

// ─── 確認ダイアログ ──────────────────────────────────────────

function ConfirmDialog({
  open, title, description, confirmLabel = "実行", danger = false,
  onConfirm, onCancel,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent className="bg-[#1a1a1a] border-[#333] text-white p-0 overflow-hidden max-w-sm">
        <div className={`h-1 w-full ${danger ? "bg-red-600" : "bg-[#f4931a]"}`} />
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-black uppercase tracking-widest text-white"
              style={{ fontFamily: "var(--font-barlow)" }}>
              {title}
            </DialogTitle>
            <DialogDescription className="text-[#888] text-sm leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 border border-[#444] text-[#888] py-2 text-sm font-black uppercase tracking-widest hover:bg-[#222] transition-colors"
              style={{ fontFamily: "var(--font-barlow)" }}>
              キャンセル
            </button>
            <button onClick={onConfirm}
              className={`flex-1 py-2 text-sm font-black uppercase tracking-widest transition-colors text-white ${danger ? "bg-red-700 hover:bg-red-600" : "bg-[#f4931a] hover:bg-orange-500"}`}
              style={{ fontFamily: "var(--font-barlow)" }}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── 認証モーダル ────────────────────────────────────────────

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
      <DialogContent className="bg-[#1a1a1a] border-[#333] text-white p-0 overflow-hidden max-w-sm">
        <div className="h-1 bg-[#f4931a] w-full" />
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black uppercase tracking-widest text-white"
              style={{ fontFamily: "var(--font-barlow)" }}>
              Admin Access
            </DialogTitle>
            <DialogDescription className="text-[#888] text-sm">
              パスワードを入力してください
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              autoFocus placeholder="Password"
              className="w-full bg-[#222] border border-[#444] text-white px-3 py-2 text-sm font-bold tracking-wider focus:outline-none focus:border-[#f4931a]"
              style={{ fontFamily: "var(--font-barlow)" }} />
            {error && (
              <p className="text-red-400 text-sm font-bold uppercase tracking-wide"
                style={{ fontFamily: "var(--font-barlow)" }}>{error}</p>
            )}
            <button type="submit" disabled={loading || !password}
              className="w-full bg-[#f4931a] text-white py-2 text-sm font-black uppercase tracking-widest hover:bg-orange-500 transition-colors disabled:opacity-40"
              style={{ fontFamily: "var(--font-barlow)" }}>
              {loading ? "Verifying..." : "Login"}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── チーム名編集パネル ──────────────────────────────────────

function TeamNameEditor({ teams, setTeamName }: {
  teams: string[]
  setTeamName: (i: number, name: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#ccc] bg-[#ececec]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm font-black uppercase tracking-widest text-[#555] hover:bg-[#e0e0e0] transition-colors"
        style={{ fontFamily: "var(--font-barlow)" }}
      >
        <span>チーム名を編集</span>
        <span className="text-[#aaa]">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {teams.map((name, i) => (
            <div key={i} className="flex items-center gap-2 bg-white px-3 py-2">
              <span className="text-lg font-black text-[#aaa] w-6"
                style={{ fontFamily: "var(--font-barlow)" }}>{i + 1}</span>
              <input
                value={name}
                onChange={(e) => setTeamName(i, e.target.value)}
                placeholder={`TEAM ${i + 1}`}
                className="flex-1 bg-transparent border-b border-[#ccc] text-[#1a1a1a] font-black uppercase tracking-wide text-base focus:outline-none focus:border-[#f4931a] placeholder:text-[#bbb]"
                style={{ fontFamily: "var(--font-barlow)" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── フェーズごとの戻るラベル ────────────────────────────────

const backLabel: Partial<Record<Phase, string>> = {
  group: "← Setup",
  playoffs: "← Group Stage",
  done: "← Playoffs",
}

const backConfirm: Partial<Record<Phase, { title: string; description: string; danger: boolean }>> = {
  group: {
    title: "セットアップに戻る",
    description: "グループステージのスコアはすべてリセットされます。チーム名は保持されます。本当に戻りますか？",
    danger: true,
  },
  playoffs: {
    title: "グループステージに戻る",
    description: "プレーオフのスコアは保持されます。グループステージのスコアを編集できます。",
    danger: false,
  },
  done: {
    title: "プレーオフに戻る",
    description: "プレーオフのスコアを再度編集できるようになります。",
    danger: false,
  },
}

// ─── メインの管理コンテンツ ──────────────────────────────────

function AdminContent() {
  const {
    phase, teams, matches, playoffs, isLoading,
    setPhase, setTeamName, generateMatches,
    updateMatch, clearMatchScore, updatePlayoff, setPlayoffTeams,
    goBack, resetTournament,
  } = useTournamentContext()

  const [confirmBack, setConfirmBack] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const standings = calcStandings(teams, matches)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e8e8e8]">
        <span className="text-2xl font-black uppercase tracking-widest text-[#888]"
          style={{ fontFamily: "var(--font-barlow)" }}>Loading...</span>
      </div>
    )
  }

  const top4 = standings.slice(0, 4)
  const confirm = backConfirm[phase]

  return (
    <div className="min-h-screen bg-[#e8e8e8]">
      {/* Header */}
      <header className="bg-[#1a1a1a] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#f4931a]" />
            <h1 className="text-2xl font-black uppercase tracking-widest text-white"
              style={{ fontFamily: "var(--font-barlow)" }}>Admin Panel</h1>
          </div>
          <PhaseBadge phase={phase} />
        </div>
      </header>

      {/* アクションバー */}
      <div className="bg-[#252525] px-6 py-2">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {/* 戻るボタン */}
          <div>
            {backLabel[phase] && (
              <button
                onClick={() => setConfirmBack(true)}
                className="text-xs font-black uppercase tracking-widest text-[#aaa] hover:text-[#f4931a] transition-colors"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                {backLabel[phase]}
              </button>
            )}
          </div>
          {/* リセット */}
          <button
            onClick={() => setConfirmReset(true)}
            className="text-xs font-black uppercase tracking-widest text-[#555] hover:text-red-400 transition-colors"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            ⟳ Reset All
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
        {/* Setup */}
        {phase === "setup" && (
          <section>
            <SectionTitle>Team Setup</SectionTitle>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mb-4">
              {teams.map((name, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#ececec] px-3 py-2">
                  <span className="text-lg font-black text-[#aaa] w-6"
                    style={{ fontFamily: "var(--font-barlow)" }}>{i + 1}</span>
                  <input
                    value={name}
                    onChange={(e) => setTeamName(i, e.target.value)}
                    placeholder={`TEAM ${i + 1}`}
                    className="flex-1 bg-transparent border-b border-[#ccc] text-[#1a1a1a] font-black uppercase tracking-wide text-lg focus:outline-none focus:border-[#f4931a] placeholder:text-[#bbb]"
                    style={{ fontFamily: "var(--font-barlow)" }}
                  />
                </div>
              ))}
            </div>
            <OWButton
              onClick={() => { generateMatches(); setPhase("group") }}
              disabled={teams.filter(Boolean).length < 2}
            >
              Start Group Stage
            </OWButton>
          </section>
        )}

        {/* Group */}
        {phase === "group" && (
          <section className="space-y-6">
            <div>
              <SectionTitle
                action={
                  <OWButton
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
                  >
                    → Playoffs
                  </OWButton>
                }
              >
                Group Stage
              </SectionTitle>
              <TeamNameEditor teams={teams} setTeamName={setTeamName} />
            </div>

            <div>
              <SectionTitle>Standings</SectionTitle>
              <StandingsTable standings={standings} />
            </div>

            <div>
              <SectionTitle>Matches</SectionTitle>
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} teams={teams}
                  onUpdate={updateMatch}
                  onClearScore={clearMatchScore} />
              ))}
            </div>
          </section>
        )}

        {/* Playoffs */}
        {(phase === "playoffs" || phase === "done") && (
          <section className="space-y-6">
            <div>
              <SectionTitle
                action={
                  phase === "playoffs" ? (
                    <OWButton variant="outline" onClick={() => setPhase("done")}>
                      End Tournament
                    </OWButton>
                  ) : undefined
                }
              >
                Playoffs
              </SectionTitle>
              {phase === "playoffs" && (
                <TeamNameEditor teams={teams} setTeamName={setTeamName} />
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
      </div>

      {/* 戻る確認ダイアログ */}
      {confirm && (
        <ConfirmDialog
          open={confirmBack}
          title={confirm.title}
          description={confirm.description}
          confirmLabel="戻る"
          danger={confirm.danger}
          onConfirm={() => { goBack(); setConfirmBack(false) }}
          onCancel={() => setConfirmBack(false)}
        />
      )}

      {/* リセット確認ダイアログ */}
      <ConfirmDialog
        open={confirmReset}
        title="トーナメントをリセット"
        description="チーム名・スコア・フェーズすべてを初期状態に戻します。この操作は元に戻せません。"
        confirmLabel="全リセット"
        danger={true}
        onConfirm={() => { resetTournament(); setConfirmReset(false) }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}

// ─── ページ本体 ──────────────────────────────────────────────

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
      <div className="flex min-h-screen items-center justify-center bg-[#e8e8e8]">
        <span className="text-2xl font-black uppercase tracking-widest text-[#888]"
          style={{ fontFamily: "var(--font-barlow)" }}>Verifying...</span>
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
