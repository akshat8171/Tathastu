# Tathastu Tower — exhibition stall game

A Kahoot-style stacking game for the stall. The crowd scans one QR code and follows @tathastukeepsakes. Each person
enters a name and WhatsApp number, then waits. When the host reads out the round's 4-digit code, everyone types it in.
The big screen fills with names, the host presses **Start**, and every phone counts down together and plays the same
tower. Live race bars show on the TV, then the podium, and at the end of the day the winner is revealed.

| Where | What |
| --- | --- |
| `/tower` | Phones (the QR code points here) |
| `/tower/screen` | Stall TV / monitor (open it and press F11) |
| `/admin/tower` | Host console (admin login) |

## One-time setup

1. **Database.** In the Supabase dashboard, open **SQL Editor → New query**. Paste all of
   `supabase/migration-017-tower.sql` and press **Run**. It is safe to run again. It also upgrades the earlier
   Instagram-handle version of the tables. If the site still says "Run supabase/migration-017-tower.sql", the script
   has not been run on the project the site uses. Check the project URL matches `NEXT_PUBLIC_SUPABASE_URL` in Vercel.
2. **Admin login.** Sign in at `/login` with **tathastukeepsakes@gmail.com**. Use **Continue with Google** if that is a
   Gmail account. The store owner address is always an admin. `ADMIN_EMAILS` (comma-separated, in Vercel) only *adds*
   more people. If `/admin` sends you back to the login page with "this account doesn't have admin access":
   - The browser is signed in as a different account. Tap **Sign out of the current account first**, then sign in again.
   - You signed up with email + password but never clicked the confirmation email. Use Google, or confirm the email.
     The admin check requires a verified address.
3. Print the QR code from the host console, or show it on the TV (the lobby screen has it).

## On the day

1. `/admin/tower` → **Go live**. Name the day and set how many rounds each person may play (default 3).
2. Gather the crowd. Everyone scans, follows, and enters their name and WhatsApp number.
3. **＋ New round** gives a 4-digit code. Read it out loud. If you tick **Show the code on the TV**, anyone who can see
   the screen can join.
4. Names pop up on the TV as people join. When enough are in, press **▶ Start**. Every phone and the TV count down
   6 seconds together, then everyone stacks the same tower.
5. The TV shows live race bars. When everyone has finished (or you press **■ End round**), the podium is revealed
   3rd → 2nd → 1st.
6. Repeat from step 3. A new code is generated each round, so last round's code never works again.
7. At the end of the day, check the leader follows @tathastukeepsakes, then press **🏆 Announce winner**. The TV plays
   the winner reveal, and you can WhatsApp them from the players table.

Ending a round that never started (still in the lobby) does not use up anyone's turn.

### Host tools in the players table

- **WhatsApp number**: opens a chat on wa.me. "Offers ✅" means they opted in to marketing messages.
- **+1 round**: lets someone play again, e.g. if their phone died mid-game.
- **Reset phone**: signs the number out of its current phone so they can use another one. (A number can only be
  signed in on one phone at a time. "Next player" on the phone does this too.)
- **Hide**: removes a player from the TV and the leaderboard (rude name, did not follow, cheating).
- **⚠ check**: almost every drop was perfect, which may be scripted. Watch them play before announcing.
- **Download CSV**: every player and game, with names, WhatsApp numbers, wa.me links, opt-in, and scores.

Phone numbers never appear on the TV or in any public API. The TV shows names only. Two players with the same name get
the last two digits of their number added (e.g. "Priya ·10").

## Kahoot

Kahoot cannot be plugged into this game. It has no public API or webhooks, and its games cannot be embedded in
another site. Its reporting API and custom player identifiers are on paid business plans and still do not let
outside games feed scores in. So this game reproduces the Kahoot flow itself (one code, lobby, synced start, live
board, podium), with the names, WhatsApp numbers, and scores saved in your own database.

## Why it won't lag or crash

- The game is a single canvas `requestAnimationFrame` loop. React does no work per frame. Pixel density is capped at 2×,
  and only the top 36 layers are drawn.
- Nothing the game does mid-play needs the network. Taps are saved to the phone after every drop. Live progress for the
  TV is sent every 2 s as fire-and-forget, so a slow network never stalls the game.
- Phones and the TV sync clocks with the server, so the countdown hits GO at the same moment everywhere.
- The public board is cached for 1 second at the CDN. A crowd of 100 phones polling it costs about one database read
  per second.
- If the Wi-Fi drops or the page reloads, the run is resubmitted automatically. A phone that reloads mid-round gets a
  "Start my game" button and its own 3-second countdown.
- Every API call has a timeout and retries 5xx errors with backoff.
- The server replays each run from its seed and tap timings to compute the score. A faked score is rejected, and the
  reason is logged in the CSV. A run can't start before the host's GO.
- Wrong codes are rate-limited (6 per minute per player), so the code can't be brute-forced.

## Local try-out

`npm run dev` without Supabase settings, or with `TOWER_LOCAL_STORE=memory`, uses an in-memory store. In that mode the
host console is also served at `/tower/host`, with no login. That page and its API return 404 everywhere else. To try
it from a phone on the same Wi-Fi, set `DEV_ORIGINS=<your laptop's IP>` and run `npx next dev -H 0.0.0.0`.
