import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"
import type { TournamentState } from "@/lib/tournament-types"

const KV_KEY = "tournament:state"

const initialState: TournamentState = {
  phase: "setup",
  teams: ["", "", "", "", ""],
  matches: [],
  playoffs: {
    finals: { t1: 0, t2: 1, s1: null, s2: null },
    third: { t1: 2, t2: 3, s1: null, s2: null },
  },
}

export async function GET() {
  const state = await kv.get<TournamentState>(KV_KEY)
  return NextResponse.json(state ?? initialState)
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: TournamentState = await req.json()
  await kv.set(KV_KEY, body)
  return NextResponse.json({ ok: true })
}
