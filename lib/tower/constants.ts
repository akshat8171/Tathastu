/**
 * Tathastu Tower — a one-tap stacking game for the exhibition stall.
 *
 * Shared by the browser (to draw the game) and the server (to replay every
 * run from its tap timings and compute the score itself). Change a number here
 * and both sides move together.
 */

export const TOWER_HANDLE = 'tathastukeepsakes'
export const TOWER_INSTAGRAM_URL = `https://www.instagram.com/${TOWER_HANDLE}/`

/** Footprint of the first slab, in world units. */
export const BASE_SIZE = 100
/** Height of every slab, in world units. */
export const LAYER_HEIGHT = 20
/** The moving slab sweeps from -TRAVEL to +TRAVEL around the slab below it. */
export const TRAVEL = 150
/** A drop within this distance of dead centre snaps on as a perfect layer. */
export const PERFECT_TOLERANCE = 4
/** Perfect streak needed before the slab starts growing back. */
export const GROW_AFTER_COMBO = 3
/** How much a slab grows back on each perfect once the streak is going. */
export const GROW_AMOUNT = 5
/** Slivers thinner than this fall off and end the game. */
export const MIN_SIZE = 1

/** Units per millisecond. Speed rises by SPEED_STEP each layer up to MAX_SPEED. */
export const BASE_SPEED = 0.12
export const SPEED_STEP = 0.0035
export const MAX_SPEED = 0.4

/** No tap for this long ends the game, so an abandoned phone never blocks the queue. */
export const IDLE_LIMIT_MS = 15_000
/** Hard cap on layers in one run — far beyond any human run. */
export const MAX_LAYERS = 500

export const POINTS_PER_LAYER = 10
export const PERFECT_BONUS = 10
export const MAX_COMBO_MULTIPLIER = 5

/** Default number of rounds each player may play per event. Their best score counts. */
export const DEFAULT_ATTEMPTS = 3
/** A run must be submitted within this long of starting. */
export const RUN_SUBMIT_WINDOW_MS = 30 * 60_000
/** Allowance for clock jitter and network delay when checking tap timings. */
export const RUN_CLOCK_SLACK_MS = 5_000

/** Taps closer than this to the slab spawning are ignored (double taps, a second finger). */
export const MIN_TAP_GAP_MS = 150
/** Runs at least this tall where nearly every drop was perfect get flagged for the host to check. */
export const SUSPICIOUS_MIN_LAYERS = 15
export const SUSPICIOUS_PERFECT_RATE = 0.75

/** Game codes are this many digits. The host reads it out; players type it in to join a round. */
export const ROUND_CODE_LENGTH = 4
/** Gap between the host pressing Start and the first drop, so every phone counts down together. */
export const ROUND_COUNTDOWN_MS = 6_000
/** Phones send their live score to the big screen at most this often while playing. */
export const PROGRESS_INTERVAL_MS = 2_000
/** Names on the big screen are kept short, Kahoot-style. */
export const NAME_MAX_LENGTH = 20
/**
 * A game that lands within this long after a round ends still counts for that round's
 * winner, so a drop that finishes as the host taps End round (or clocks a few ms apart)
 * is not lost. Anything later only counts towards the player's best score of the day.
 */
export const ROUND_END_GRACE_MS = 2_000
