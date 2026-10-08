# Tathastu Tower — exhibition stall game

A one-tap stacking game (in the style of the classic "Stack" game). Visitors scan the stall QR code,
follow @tathastukeepsakes, and play on their own phone. The stall monitor shows a live leaderboard,
and you announce the winner from the admin.

| Who | URL |
|---|---|
| Visitors (QR target) | `https://www.tathastukeepsakes.in/tower` |
| Stall monitor / TV | `https://www.tathastukeepsakes.in/tower/screen` (press F11, then click **Enable sound**) |
| You (host console) | `https://www.tathastukeepsakes.in/admin/tower` |

## One-time setup

1. In the Supabase SQL editor, run `supabase/migration-017-tower.sql`.
2. Optional: set `TOWER_FOLLOW_CHECK` in Vercel. The default is `honor`; see below.
3. Deploy.

## On the day

1. Open **/admin/tower** and click **Go live**. Give the event a name and choose the tries per person (3 is the default).
2. On the monitor, open **/tower/screen** and go full screen. The demo tower auto-plays to draw people in.
3. Print the QR code from the host console, or let people scan the one on the monitor.
4. Each visitor goes through these steps:
   1. Tap **Follow @tathastukeepsakes**. Instagram opens.
   2. Come back and tap **I'm following**.
   3. Type their Instagram username.
   4. Play. Each tap drops a slab, and perfect drops build a combo bonus.
   5. Tap **Next player** to hand the phone to the next person, if you're using a shared stall phone.
5. To finish:
   1. Click **Close entries**.
   2. Let the last games finish (the console shows "Playing now").
   3. Tap the leader's @handle to confirm they follow you.
   4. Click **🏆 Announce winner**. The monitor shows a full-screen confetti reveal.
   5. If the leader doesn't follow, click **Disqualify** and announce again.
6. **Download CSV** has every player and every game: score, layers, perfect drops, timestamps and any rejection reason.

### Host tools in the players table

- **⚠ check**: the player's best run has almost every drop perfect, which is typical of a script. Watch them play once before
  you announce. The announce dialog warns you too.
- **+1 try**: give an extra go, for example if a phone died mid-game.
- **Reset phone**: a username can only be signed in on one phone, so nobody can type a rival's handle and burn their
  tries. If someone switches phones or clears their browser, reset them and they can sign in again.
  **Next player** on a shared stall phone does this automatically.
- **Disqualify / Restore**: remove someone from the leaderboard, or bring them back.

The announcement is pinned to the leader you saw. If someone overtakes them in the last seconds, the console asks you
to check again. Games that finish after the announcement are still recorded, but they can't change the winner.

For a second day, use **Start new event**. You get a fresh leaderboard, and old events stay downloadable.

## Follow check modes

- **`honor` (default)**: the player must open the Instagram follow link before they can continue. Instagram has no
  public API for "does X follow me", so staff check the winner by hand. This takes 2 seconds with the handle link in the console.
- **`instagram`**: the player DMs a PLAY code to @tathastukeepsakes. The webhook reads `is_user_follow_business`, and the
  game only unlocks for followers. It uses the same pipeline as Layer Rush. It requires the Meta app to be **Live** (in
  Development mode, only testers' DMs arrive), with `instagram_business_manage_messages` and the `messages` webhook subscribed.

## Why it won't lag or crash

- The game is a single canvas `requestAnimationFrame` loop. React does no work per frame. Pixel density is capped at 2×,
  and only the top 36 layers are drawn.
- Nothing the game does mid-play needs the network. Taps are saved to the phone after every drop.
- If the Wi-Fi drops or the page reloads, the run is resubmitted automatically.
- Every API call has a timeout and retries 5xx errors with backoff.
- The server replays each run from its seed and tap timings to compute the score. A faked score is rejected,
  and the reason is logged in the CSV.
- Each try is single-use. Reloading mid-game submits the partial run instead of granting a free retry. If a phone
  dies, you can give that player **+1 try**.
