# Yearly / Kaizen — Consolidated Problem Definition & Research

> Generated: 2026-06-28
> Status: Definition document — synthesizes the original Kaizen PRD (2026-03-05),
> the current verbal brief, and four parallel research sweeps (competitive
> landscape, data modeling, UI/UX, technical stack).
> Purpose: turn scattered problem statements into one defined shape. **No code yet.**

---

## 0. What this app is, in one paragraph

A **personal, local-first, minimalist goal tracker** for a single user (you). You
define goals; each goal is either a **checkbox** (boolean yes/no) or a **numeric
value with a custom unit** (e.g. "steps", "ml", "pages"). Goals are tracked over a
**period** — daily, weekly, monthly, quarterly, 6-month, or yearly — and judged
**not just by sum, but by a per-goal aggregation rule** (mean, median, mode, sum,
min, max). The headline example: *"average 10,000 steps per week"* — logged daily,
but success is the weekly **mean**, so an 8k day and a 12k day still pass. The UI is
**near-monochrome (black & white), typography-led, minimal-friction**, with a
**calendar overview that shows how many goals you hit each day** at a glance.

---

## 1. How today's brief extends the original Kaizen PRD

The 2026-03-05 PRD is solid and ~80% reusable. Three deliberate **expansions** from
today's brief change the core model, so they need to be designed in from the start
rather than bolted on:

| Dimension | Original PRD (2026-03-05) | Today's brief | Impact |
| --- | --- | --- | --- |
| **Aggregation** | Numeric period goals use **SUM only** | Per-goal choice of **mean / median / mode / sum / min / max** | **Core model change.** This is the single biggest delta. Requires an "aggregation × comparator" rule on every goal (see §4). |
| **Periods** | daily / weekly / monthly | + **quarterly / 6-month / yearly** | Schema enum + period-boundary math extends; conceptually the same machinery. |
| **Cross-goal calendar** | Per-habit calendar only | A **global overview** showing "N of M goals achieved" per calendar day | **New top-level screen.** Needs a per-day completion rollup across all goals. |
| **Naming** | "Kaizen" | repo is `yearly` | Cosmetic — decide a final name. |

Everything else in the PRD (local-only, no auth, no sync, stack navigation, habit
detail with streaks + calendar, create/edit/delete, derived completion) stays valid.

---

## 2. Domain vocabulary (use these terms consistently)

- **Goal** — the *definition / rule*. Immutable-ish config: name, type, unit, period,
  target, aggregation, comparator. (PRD called this "Habit".)
- **Entry** — one *observation*: a `(goal, date, value)` data point. At most one per
  goal per day. (PRD called this "HabitLog".)
- **Period** — the window over which a goal is judged: daily, weekly, monthly,
  quarterly, semiannual, yearly.
- **Aggregation** — how the entries in a period are reduced to one number: sum, mean,
  median, mode, min, max, count.
- **Comparator** — how that number is judged against the target: at-least, at-most,
  exactly, range.
- **Rollup** — a *derived* per-period result: actual value, target, met?, completion %.
  Never stored as source of truth; always recomputed from entries + goal.
- **Streak** — consecutive *met periods* (not days, for averaged goals — see §4.4).

**Golden rule (from all research):** only two things are stored as truth — **Goal
definitions** and **Entries**. Everything else (rollups, streaks, completion %,
the calendar overview) is *derived* and recomputed. This is exactly how Loop Habit
Tracker (the open-source reference) is built, and it eliminates a whole class of
sync/invalidation bugs.

---

## 3. Goal types (the two input modes)

### 3.1 Checkbox (boolean)
- Value is yes/no. Example: "took magnesium today".
- Plus a third **skip** state for not-applicable days (rest days) — research strongly
  recommends this; skips are excluded from both numerator and denominator and do
  **not** break a streak. (Way of Life's key idea.)

### 3.2 Numeric (value + unit)
- User-defined unit ("steps", "ml", "pages", "km", "min"). Value is the measured
  quantity. Example: "10,000 steps".
- Optionally directional: "at least" (floor) vs "at most" (cap, e.g. "≤60 min social
  media") — this is the **comparator**, see §4.2.

> Storage tip from research: store decimals as fixed-point integers (value × 1000) to
> avoid float drift, especially for `exactly`/`sum` comparisons. (Loop does this.)

---

## 4. The aggregation engine (the heart of this app)

This is what makes your tracker different from every off-the-shelf app. **No
mainstream app supports per-goal median/mode targets** — only "mean" appears anywhere
(Strides' "Average" tracker type). So this is genuinely custom and worth getting right.

Model period evaluation as a **3-stage pipeline**:

```
entries in window  →  [AGGREGATE]  →  actual  →  [COMPARE vs target]  →  met? + completion%
```

### 4.1 Aggregation functions (enum, per goal)
| Function | Meaning | Example |
| --- | --- | --- |
| `SUM` | total over the window; missing day = 0 (hurts) | "10k total steps this week" |
| `MEAN` | average per day over the window | **"average 10k steps/week"** ← your headline case |
| `MEDIAN` | middle value; robust to outlier days | "typical day ≥ 8k steps" |
| `MODE` | most frequent value | niche; document tie-breaking |
| `MIN` | worst day must clear the bar | "sleep ≥6h *every* night" |
| `MAX` | best/worst day cap | "stay under 60 min on your worst day" |
| `COUNT` | number of qualifying entries | "meditate ≥4 times this week" |

### 4.2 Comparator (separate enum, orthogonal)
`AT_LEAST` · `AT_MOST` · `EXACTLY` · `RANGE`. Keeping aggregation and comparator
**orthogonal** is the trick that unlocks everything with one evaluation function:
- `MEAN + AT_LEAST` = the average-goal ("avg ≥10k/week")
- `MAX + AT_MOST` = a hard cap ("never exceed X on any day")
- `MIN + AT_LEAST` = a floor every day ("at least 6h sleep nightly")
- `SUM + AT_LEAST` = the PRD's original behavior (still supported)

### 4.3 The `MEAN` subtlety — denominator policy
"Average" is ambiguous; pick one per goal (default = **expected days**):
- **Present days** — mean over days with data (missing ignored) → forgiving
- **All calendar days** — missing counts as 0 → strict (equals SUM ÷ period length)
- **Expected days** — excludes SKIP, counts missed as 0 → **recommended default**

### 4.4 Streak semantics differ by goal kind
- **Binary / SUM / COUNT goals:** streak = consecutive qualifying *days* (or periods).
- **Averaged (MEAN/MEDIAN) goals:** a per-day streak is meaningless — the unit of
  success is the *period*. So define streak as **consecutive met periods** ("weeks
  where the weekly mean ≥ target"). **Streak granularity = the goal's period.**

### 4.5 Window mode — calendar-aligned vs rolling (decide per goal)
"Average 10k/week" can mean two different things; this must be an explicit field:
- **Calendar-aligned:** Mon–Sun bucket, resets each week. Good for "this week".
- **Rolling:** trailing 7 days ending today, never resets. Good for "keep a 7-day avg".

They produce different numbers and different streaks. Default suggestion:
calendar-aligned for weekly/monthly+, with rolling as an opt-in.

### 4.6 Completion % — normalize everything to [0,1]
So binary and numeric share one UI and one scoring path:
- Binary: `met ? 1 : 0`
- Numeric `AT_LEAST`: `clamp(actual / target, 0, 1)`
- Numeric `AT_MOST`: invert so exceeding the cap lowers the score

### 4.7 Edge cases to design for (from research)
- **Missing days:** decide per aggregation = 0 / ignored / unknown. Use an explicit
  `UNKNOWN` sentinel distinct from a real `0` and from `SKIP`.
- **Partial / in-progress period:** never mark an open week as *failed* until it
  closes. Show "actual so far" and optionally a projected pace.
- **Timezones / day boundary:** key entries on the user's **local civil date**
  (YYYY-MM-DD), not a UTC instant. Optionally a per-goal "day rollover hour" (e.g. 4am
  for night owls). Configurable week-start (Mon vs Sun).
- **Rule changes:** since rollups are derived, editing a target just triggers
  recompute. If you want historical correctness, version the rule with an effective
  date (optional, post-MVP).

### 4.8 Optional: "habit strength" score (gentler than streaks)
Loop computes a smoothed score (exponential moving average) so a few misses after a
long run don't reset progress. Worth offering as a calmer companion metric to the
hard streak. Works identically for binary and numeric once normalized to [0,1].

---

## 5. Competitive landscape — what to borrow, what to avoid

**Most relevant apps to study:** Strides (goal-type taxonomy + "Average"/pace),
Loop Habit Tracker (open-source; decay score + measurable thresholds — inspect its
model directly), HabitKit (contribution-grid visual), Daylio (Year-in-Pixels +
averaging), Way of Life (skip-excluded scoring).

**Validated unmet need (your opportunity):** nobody combines (a) a forgiving
averaging/decay model, (b) first-class long-range periods as real *targets*
(quarterly/6-month/yearly, not just chart views), and (c) one-tap numeric entry, and
(d) a contribution-grid overview — all in one minimalist app. That intersection is
exactly your brief.

**Top complaints to design *away* from:**
1. Streaks that reset on a single miss → offer skip days / averaging / decay.
2. Restrictive free-habit caps → moot (personal app, no limits).
3. Numeric entry friction (Loop's scroll-to-enter) → one-tap increment.
4. Unreliable reminders → out of scope for MVP anyway.
5. Confusing weekly/numeric goal logic → make the period + aggregation legible in UI.

---

## 6. UI / UX direction (minimalist, monochrome)

### 6.1 The calendar overview (your "how many goals per day" view)
Encode a **ratio** (goals hit ÷ goals due that day), not just done/not-done. Best
monochrome options:
- **Opacity/shading squares (GitHub-contribution style)** for the long-range year
  view — map the ratio to ~5 grayscale steps (empty → solid black = all goals done).
  Best for "consistency at a glance". (You already have a `DayStrip` — this is its
  zoomed-out sibling.)
- **Segmented mini-bar or single ring** inside a month-grid cell when the literal
  count matters (works when goal count is small).
- Always add a **non-color cue** for key states: a border/ring for "today", a full
  solid for a "perfect day". (Monochrome + accessibility both demand this.)
- Every cell tappable → that day's detail.

### 6.2 Low-friction logging (friction is the enemy)
Target: a full daily check-in in **under ~20 seconds**.
- Binary → **one-tap toggle**, instant fill + haptic.
- Small numbers → **stepper (+/−)**, no keyboard.
- Precise numbers → numeric keypad (tap the big number).
- Avoid sliders for precision.
- (Post-MVP friction wins: interactive widgets, Apple Health auto-complete for steps.)

### 6.3 Monochrome system
- Typography-led hierarchy (one sans family; big confident numbers, muted secondary).
- Grayscale + opacity = the state system (black = done, ~40% = partial, hairline =
  empty/future). Design in grayscale first.
- Generous whitespace; reserve at most *one* accent for the single most important
  signal (e.g. active streak / perfect day).

### 6.4 Goal-definition UX — progressive disclosure
Gate the form by goal *type* first (Strides-style), then reveal only relevant fields:
- **Core (always):** name, type (checkbox / numeric).
- **Numeric reveals:** unit.
- **Advanced (tap to expand):** period, target value, aggregation method, comparator,
  window mode, color/icon, notes.
- **Expert/rare:** at-most (cap) mode, mean-denominator policy, day-rollover hour.

Don't dump mean/median/mode on the user up front — most goals are "daily checkbox" or
"daily/weekly numeric at-least". Surface the exotic aggregations only when they expand
the advanced section.

### 6.5 Information architecture
The original PRD chose **stack-only, no tab bar**. Today's brief adds a global
calendar overview as a first-class destination, which nudges toward **2–3 tabs**:

- **Today** (checklist — one-tap logging; the day's overall ratio at top)
- **Calendar / Overview** (the cross-goal heatmap; tap a day → that day's detail)
- **Settings** (or fold into a profile)
- Goal detail (streak + trends + per-goal calendar) and create/edit = pushed screens.

> Decision needed: keep the PRD's stack-only model and reach the overview via the
> Today header, **or** introduce a small tab bar. Recommend a minimal 2-tab bar
> (Today · Calendar) given the overview is now central.

---

## 7. Recommended technical stack (RN + Expo, 2025–2026)

The app's hard problem is **aggregation over date ranges** (averages, medians,
streaks). That is a SQL strength and a NoSQL weakness — so:

| Layer | Choice | Why |
| --- | --- | --- |
| **Relational store** | **expo-sqlite + Drizzle ORM** (+ drizzle-kit migrations) | First-party, real SQL (`AVG`/`SUM`/`GROUP BY`, window functions for median/streaks), type-safe, reactive `useLiveQuery`. Best fit for goals + time-series entries. |
| **Key-value / prefs** | **react-native-mmkv** | Settings, UI state; ~30× faster than AsyncStorage. |
| **State** | **Drizzle `useLiveQuery` (data) + Zustand (UI/ephemeral)** | DB is the source of truth; no Redux, no React Query (no server). |
| **Charts** | **victory-native (XL)** (Skia) | GPU-accelerated trend/bar charts; minimalist-friendly. |
| **Heatmap / contribution grid** | **custom react-native-svg grid** | Off-the-shelf RN heatmap libs are stale; a custom grid is small and fully themeable. |
| **Calendar UI** | **react-native-calendars** *(only if a full month view is needed)* | Mature; otherwise the custom grid suffices. |
| **Dates** | **date-fns v4** + SQL `strftime`/`date()` for bucketing | Tree-shakeable; do heavy date-bucketing in SQL. |
| **IDs** | `expo-crypto` | uuid generation. |
| **(Post-MVP) Reminders** | `expo-notifications` | Local triggers; handle Android 12+ exact-alarm + channels. |
| **(Post-MVP) Backup/export** | `expo-file-system` + `expo-sharing` | JSON/CSV via share sheet → iCloud/Drive. |

**Build note:** MMKV + victory-native/Skia push you onto an **Expo Dev Client / EAS
build** (the standard 2025–2026 workflow), not Expo Go. If you want to stay in Expo
Go, the all-compatible variant is: expo-sqlite + AsyncStorage +
react-native-gifted-charts + SVG heatmap + date-fns.

> **Reconciliation with PRD:** the original AI-context doc specified "expo-sqlite, no
> ORM". Recommendation is to **add Drizzle** — the aggregation queries (medians,
> rolling windows, streaks) benefit a lot from type-safe SQL + migrations, and it
> keeps an easy upgrade lane to op-sqlite/Turso if you ever want sync. Current
> `package.json` has neither sqlite nor zustand yet, so nothing to undo.

---

## 8. Recommended conceptual schema (extends the PRD)

Two stored entities + derived rollups. Fields new vs the PRD are **bold**.

### `Goal` (definition)
`id`, `name`, `notes`, `icon`, `color`, `valueType` (boolean | numeric),
`unit`, **`period`** (daily | weekly | monthly | quarterly | semiannual | yearly),
**`windowMode`** (calendar | rolling), **`windowLengthDays`** (rolling only),
**`weekStart`** (mon | sun), **`aggregation`** (sum | mean | median | mode | min |
max | count), **`meanDenominatorPolicy`** (present | all | expected),
**`comparator`** (at_least | at_most | exactly | range), `targetValue`
(+ `targetMin`/`targetMax` for range), **`dayRolloverHour`**, `sortOrder`,
`isArchived`, `createdAt`, `updatedAt`.

### `Entry` (observation) — unique on `(goalId, date)`
`id`, `goalId`, `date` (local YYYY-MM-DD), `value` (boolean code or numeric×scale),
**`state`** (logged | skip | unknown — cleaner than overloading magic numbers),
`notes`, `loggedAt`.

### Derived (recompute; cache only if needed)
- **`PeriodRollup`** — `goalId`, `periodStart/End`, `actual`, `target`,
  `completionPct`, `isMet`, `isPartial`, sample/missing/skip counts.
- **`Streak`** — per goal, runs of consecutive met *periods*.
- **Daily overview rollup** — for the calendar overview: per date, `goalsDue` and
  `goalsMet` across all goals → the ratio each cell renders.

Key tradeoffs (all from research): derive-don't-store rollups for correctness;
single overloaded `Entry.value` + separate `state` enum over polymorphic tables;
fixed-point ints for numeric; calendar-vs-rolling as *data* not code; aggregation ×
comparator as an orthogonal matrix.

---

## 9. Suggested MVP cut (opinionated)

To avoid the aggregation engine ballooning scope, ship in layers:

**MVP (v1):**
- Goal types: checkbox + numeric (with unit).
- Periods: daily, weekly, monthly.
- Aggregation: **sum + mean** (covers "10k total/week" and "avg 10k/week"); comparator
  at_least + at_most. Defer median/mode/min/max to v2.
- Today screen (one-tap logging) + cross-goal calendar overview + goal detail
  (streak + per-goal calendar) + create/edit/delete.
- Local persistence (expo-sqlite + Drizzle), skip state, civil-date keying.

**v2:**
- median / mode / min / max aggregations.
- Quarterly / 6-month / yearly periods.
- Rolling windows, habit-strength score.

**Later:**
- Reminders, widgets, Apple Health auto-complete, export/backup.

---

## 10. Open decisions for you

1. **Name:** "Kaizen" (PRD) vs "Yearly" (repo) vs something else?
2. **Navigation:** stack-only (PRD) vs a minimal 2-tab bar (Today · Calendar)?
   (Leaning tab bar, since the overview is now central.)
3. **ORM:** adopt Drizzle (recommended) vs raw expo-sqlite (PRD)?
4. **MVP aggregation cut:** sum + mean only for v1 (recommended) vs all six up front?
5. **Default window mode:** calendar-aligned vs rolling for averaged goals?
6. **Expo Go vs Dev Client:** accept the dev-client build (unlocks MMKV + Skia
   charts) vs stay in Expo Go with lighter libs?

---

## Appendix — research source pointers

- Loop Habit Tracker (open source model): github.com/iSoron/uhabits — `Habit.kt`,
  `Entry.kt`, `Frequency.kt`, `Score.kt`.
- Strides (goal-type taxonomy + Average/pace): stridesapp.com.
- Calendar-aligned vs rolling windows (SLO framing): nobl9 / Datadog rollup docs.
- Drizzle + expo-sqlite local-first: orm.drizzle.team/docs/connect-expo-sqlite;
  example habit tracker: github.com/israataha/expo-sqlite-drizzle.
- Realm/Atlas Device SDK is **deprecated (EOL Sep 30 2025)** — do not use.
- victory-native XL: github.com/FormidableLabs/victory-native-xl.
- Year-in-Pixels / contribution-grid UI patterns: HabitKit, Daylio, Mood-by-Pixels.
</content>
</invoke>
