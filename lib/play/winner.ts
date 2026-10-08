export interface WinnerCandidate {
  passId: string
  username: string
  composite: number
  accuracy: number
  clutch: number
  submittedAtMs: number
  alreadyWon: boolean
}

/** Exactly one eligible player. Past draw winners stay on the board and cannot win again. */
export function pickWinner(candidates: WinnerCandidate[]): WinnerCandidate | null {
  const eligible = candidates
    .filter((candidate) => !candidate.alreadyWon && candidate.submittedAtMs > 0)
    .slice()
    .sort(compareCandidates)
  return eligible[0] ?? null
}

function compareCandidates(left: WinnerCandidate, right: WinnerCandidate): number {
  if (right.composite !== left.composite) return right.composite - left.composite
  if (right.accuracy !== left.accuracy) return right.accuracy - left.accuracy
  if (right.clutch !== left.clutch) return right.clutch - left.clutch
  if (left.submittedAtMs !== right.submittedAtMs) return left.submittedAtMs - right.submittedAtMs
  return left.passId < right.passId ? -1 : 1
}
