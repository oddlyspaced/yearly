# Kaizen — Product Requirements Document

> Generated: 2026-03-05
> Status: Draft — ready for development planning
> Related: See `2026-03-05-kaizen-ai-context.md` for the AI coding context

---

## 1. Overview

**App name:** Kaizen
**One-liner:** A fully customisable habit tracker that lets you define, log, and reflect on any habit — your way.
**Problem it solves:** Most habit trackers are opinionated — they push specific categories (fitness, hydration, sleep) or rigid tracking methods. Users who want to track something unique — an investment amount, a creative writing word count, a custom wellness metric — are forced to shoehorn their habit into a system that wasn't built for it. Kaizen solves this by giving users a blank canvas: define the habit, choose how to track it, and set your own targets.
**Target audience:** Individual consumers who are intentional about self-improvement — people who want to build better habits across any area of their life without being constrained by a pre-set category system.
**Platform:** iOS and Android

---

## 2. Goals & Success Metrics

**Primary goal:** Ship a focused, beautiful habit tracker that users reach for every day because it fits their life — not the other way around.
**MVP goal:** A fully functional local habit tracker where users can create any habit, log it daily, and see their history and streaks — with no login, no friction.

**Key metrics to track:**

-   Daily active usage (do users return every day?)
-   Habit completion rate (are users hitting their targets?)
-   Number of habits created per user (signal of engagement depth)
-   Retention at day 7, day 30 (are users sticking with it?)

---

## 3. User Personas

### Persona 1: The Self-Improvement Enthusiast — Priya, 28

-   **Who:** Works in marketing, reads self-help books, follows a loose morning routine
-   **Goals:** Track her meditation, journaling, and water intake as part of a broader wellness system
-   **Needs from this app:** Simple daily check-in, clear visual streak history, no unnecessary complexity
-   **Pain points today:** Existing apps have too many pre-set habits that don't match what she actually tracks; she wants to add her own without jumping through hoops
-   **Behaviour patterns:** Opens the app first thing in the morning and before bed; motivated by streaks and visible progress

### Persona 2: The Numbers Tracker — James, 35

-   **Who:** Software engineer, data-driven, tracks financial, fitness, and productivity metrics
-   **Goals:** Log daily step count, weekly investment contributions, and reading time
-   **Needs from this app:** Numeric input with flexible units and targets, history with a clear calendar view, ability to log different values each day
-   **Pain points today:** Most habit apps only support binary done/not-done; he needs to track actual values over time
-   **Behaviour patterns:** Logs at the end of the day during his review ritual; cares about accurate historical data more than gamification

### Persona 3: The Simple Habit Builder — Anika, 22

-   **Who:** Student building basic daily routines for the first time — workout, no-phone mornings, reading
-   **Goals:** Simple yes/no tracking for a handful of habits
-   **Needs from this app:** Dead-simple checkbox-style logging, clean home screen, clear completed vs incomplete view
-   **Pain points today:** Overwhelmed by apps with too many features; wants something that just works
-   **Behaviour patterns:** Quick tap-and-go; spends less than 30 seconds in the app per session

---

## 4. Platform & Constraints

| Property        | Decision              | Notes                                          |
| --------------- | --------------------- | ---------------------------------------------- |
| Platform        | iOS + Android         | React Native for shared codebase               |
| Auth            | None                  | No accounts, no login — zero friction          |
| Backend         | Local only            | All data stored on device; no network requests |
| Offline support | Full — always offline | The app is inherently offline                  |
| Dark mode       | System default        | Follows device light/dark setting              |
| Data export     | Not in scope          |                                                |
| Widgets         | Not in scope          |                                                |

---

## 5. Navigation Structure

**Pattern:** Stack only — no persistent bottom navigation.
**Rationale:** The app is centred around a single dashboard. All actions are drilled into from the home screen (habit detail, create, edit). A tab bar would add navigation overhead that isn't needed at this scope.

### Navigation map

```
RootStack (Stack)
├── HomeScreen                      ← default screen
├── HabitDetailScreen               ← tap a habit card
├── CreateHabitScreen               ← tap + on home
└── EditHabitScreen                 ← tap edit from HabitDetail
```

---

## 6. Screen Inventory

---

### HomeScreen

-   **Purpose:** The user's daily dashboard — shows all habits split into incomplete and completed for today.
-   **Entry points:** App launch (default screen)
-   **Key elements:**
    -   **Header:** Time-of-day greeting (e.g. "good morning", "good afternoon", "good evening") — no user name, `+` button (top right) to create a new habit
    -   **Incomplete habits section:** List of habits not yet completed today. Each card shows the habit name, icon, colour, tracking type indicator, and current progress (e.g. "9 / 10 glasses" or an unticked checkbox). Numeric habits show a quick `−` and `+` button inline. Checkbox habits show a tappable checkbox.
    -   **Completed habits section:** Habits that have been completed today (target reached, checkbox ticked, or manually marked). Shown below incomplete habits with a subdued visual treatment.
    -   **Empty state (no habits yet):** Friendly prompt encouraging the user to add their first habit with a CTA button.
-   **Actions available:**
    -   Tap `+` → CreateHabitScreen
    -   Tap a habit card → HabitDetailScreen
    -   Tap `+` / `−` on a numeric card → increments / decrements value inline; updates completion state if target is hit
    -   Tap checkbox on a checkbox card → toggles completion; moves card to/from completed section
    -   Long press a habit card → context menu with options: Edit, Delete
-   **States:** Default / Empty (no habits) / All completed (celebratory state)
-   **Notes:**
    -   Auto-sorts: incomplete habits show first, completed below
    -   Within each section, habits are sorted alphabetically by name
    -   The greeting is time-of-day only — no user name is stored or displayed

---

### HabitDetailScreen

-   **Purpose:** Full detail view for a single habit — log today's value, view history, and access edit controls.
-   **Entry points:** Tap a habit card on HomeScreen
-   **Key elements:**
    -   **Header:** Back button (left), habit name + icon (centre), settings/edit icon (right)
    -   **Logging area (top half):**
        -   _Numeric habits:_ Large central text input showing today's current value. `−` button on the left, `+` button on the right. Below the number: unit label + target (e.g. "of 10 glasses / day"). User can tap the number to type directly or use the +/− buttons to increment/decrement.
        -   _Checkbox habits:_ Large checkbox or toggle with a label (e.g. "Done for today"). Tapping it toggles the state.
    -   **Streak stats:** Current streak and best streak displayed as stat blocks (e.g. "12 day streak · best: 30 days")
    -   **Current month calendar:** A single monthly calendar grid for the current month, shown inline on the detail screen. Each day is represented as a circle with the following states:
        -   **Future date:** Greyed-out circle; not interactive
        -   **Empty date (no value logged, or value is 0):** No border, no fill — completely blank
        -   **Partially met (numeric with target):** A partial arc border drawn around the circle reflecting progress. The arc length is proportional to progress — e.g. 4 of 8 = 50% arc. No fill inside.
        -   **Fully met (target reached, or checkbox ticked):** Fully filled circle (habit's accent colour)
        -   **Today:** Solid filled black circle (light mode) / white circle (dark mode), regardless of progress state
        -   **Days before the habit was created:** Not rendered
    -   **Grid display toggle:** A toggle control in the calendar header to switch the label shown inside each day's circle:
        -   **Value mode (default):** Each circle shows the logged value for that day (e.g. "10.5K", "8K", "30"). For days with no log, the circle is empty. For checkbox habits, no label is shown (just the filled/empty circle).
        -   **Date mode:** Each circle shows the calendar date number (e.g. 1, 2, 3 … 31). This is the conventional calendar view.
        -   The toggle state is per-session (does not need to be persisted across app restarts)
    -   **Expand button:** A button/icon alongside the calendar header (e.g. an expand arrow) that opens the full history bottom sheet. The toggle state carries over into the bottom sheet.
    -   **Calendar history bottom sheet:** A bottom sheet with two snap points:
        -   **Mid snap (default):** Sheet initially snaps to the middle of the screen, showing the most recent months' grids
        -   **Full snap (expanded):** User can drag up or tap expand to snap the sheet to the top of the screen, revealing a vertically scrollable list of all month grids from the habit's creation date to the present — most recent month first
        -   The bottom sheet can be dismissed by dragging down or tapping the backdrop
    -   **Past values log:** Chronological list of previous log entries (date + value logged). Scrollable. Shows all historical entries.
-   **Actions available:**
    -   Tap `+` / `−` → adjust today's value
    -   Tap the number input → open keyboard to type a value directly
    -   Tap checkbox → toggle today's completion
    -   Tap settings icon (top right) → EditHabitScreen
    -   Tap back → return to HomeScreen
    -   Tap expand button on calendar → opens calendar history bottom sheet at mid snap
    -   Drag bottom sheet up / tap expand → snaps to full screen showing all month grids
    -   Drag bottom sheet down / tap backdrop → dismisses bottom sheet
-   **States:** Default / Loading (initial data fetch from local DB)
-   **Notes:**
    -   For weekly/monthly targets: the progress shows the period total (e.g. "4 of 5 workouts this week")
    -   The inline calendar only shows the current month; all historical months are accessed via the bottom sheet
    -   For numeric habits with no target set: a "Mark as done" button is shown so the user can manually move it to completed

---

### CreateHabitScreen

-   **Purpose:** Create a new habit with full customisation.
-   **Entry points:** Tap `+` on HomeScreen
-   **Key elements:**
    -   **Name field:** Text input, prominently placed at the top
    -   **Icon picker:** Horizontal scrollable row or grid of preset icons to choose from
    -   **Colour picker:** Row of preset colour swatches to theme the habit card
    -   **Tracking type selector:** Toggle/segmented control — "Numeric" or "Checkbox"
    -   **Unit field** _(numeric only, shown conditionally):_ Text input for the unit label (e.g. "glasses", "steps", "km", "pages")
    -   **Target section** _(optional):_ Toggle to enable a target. When enabled: a numeric input for the target value + a period selector (Daily / Weekly / Monthly)
    -   **Notes field:** Multi-line text input for optional description or context
    -   **Save button:** Creates the habit and navigates back to HomeScreen
-   **Actions available:**
    -   Fill fields → Save → habit created, lands back on HomeScreen
    -   Tap back / cancel → discard changes, return to HomeScreen
-   **States:** Default / Validation error (name required)
-   **Notes:**
    -   Name is the only required field
    -   The unit field only appears when tracking type is "Numeric"
    -   The target section is collapsed by default; user opts in

---

### EditHabitScreen

-   **Purpose:** Edit all settings for an existing habit, or delete it.
-   **Entry points:** Tap settings icon on HabitDetailScreen, or long press → Edit on HomeScreen
-   **Key elements:** Identical form to CreateHabitScreen, pre-filled with the habit's current values
-   **Additional element:** **Delete habit** button at the bottom (destructive, requires confirmation)
-   **Actions available:**
    -   Edit fields → Save → updates habit, returns to HabitDetailScreen
    -   Tap Delete → confirmation dialog → deletes habit and all its logs, returns to HomeScreen
    -   Tap back / cancel → discard changes
-   **States:** Default / Confirmation dialog (on delete)
-   **Notes:**
    -   Changing tracking type (numeric ↔ checkbox) on an existing habit should prompt the user: "This will clear all existing log data for this habit. Continue?" — because the data formats are incompatible.
    -   Changing target period does not clear log data

---

## 7. Key User Flows

### Flow 1: Create a new habit

> **Goal:** User sets up a new habit to track
> **Entry point:** HomeScreen → tap `+`

| Step | Screen            | User Action                                    | App Response                                                    |
| ---- | ----------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| 1    | HomeScreen        | Taps `+` button                                | Navigates to CreateHabitScreen                                  |
| 2    | CreateHabitScreen | Enters habit name                              | Name field updates                                              |
| 3    | CreateHabitScreen | Selects icon and colour                        | Preview updates                                                 |
| 4    | CreateHabitScreen | Selects tracking type (Numeric or Checkbox)    | If Numeric: unit field appears. If Checkbox: unit field hidden. |
| 5    | CreateHabitScreen | (Optional) Enters unit label                   | Unit label stored                                               |
| 6    | CreateHabitScreen | (Optional) Enables target, enters value+period | Target section expands                                          |
| 7    | CreateHabitScreen | (Optional) Adds notes                          | Notes stored                                                    |
| 8    | CreateHabitScreen | Taps Save                                      | Habit created in local DB, user returned to HomeScreen          |
| 9    | HomeScreen        | —                                              | New habit appears in Incomplete section                         |

**Success outcome:** Habit visible on HomeScreen, ready to log.
**Failure paths:**

-   Name left blank → inline validation error, Save blocked

---

### Flow 2: Log a numeric habit (with daily target)

> **Goal:** User logs their water intake for the day
> **Entry point:** HomeScreen, habit card

| Step | Screen            | User Action                      | App Response                                                 |
| ---- | ----------------- | -------------------------------- | ------------------------------------------------------------ |
| 1    | HomeScreen        | Taps `+` on the water habit card | Increments value by 1; card updates to show "5 / 10 glasses" |
| 2    | HomeScreen        | Taps `+` several more times      | Value increments; card updates each time                     |
| 3    | HomeScreen        | Taps the card to open detail     | Navigates to HabitDetailScreen; shows current value (e.g. 7) |
| 4    | HabitDetailScreen | Taps the large number input      | Keyboard opens; user types "10"                              |
| 5    | HabitDetailScreen | Confirms / dismisses keyboard    | Value set to 10; "of 10 glasses / day" shows target met      |
| 6    | HabitDetailScreen | Taps back                        | Returns to HomeScreen; habit has moved to Completed section  |

**Success outcome:** Habit logged, target met, card in Completed section.
**Failure paths:**

-   User enters a negative number → clamp to 0 or show validation error

---

### Flow 3: Log a checkbox habit

> **Goal:** User marks their morning workout as done
> **Entry point:** HomeScreen, habit card

| Step | Screen     | User Action                       | App Response                                                   |
| ---- | ---------- | --------------------------------- | -------------------------------------------------------------- |
| 1    | HomeScreen | Taps checkbox on the workout card | Checkbox ticks; habit animates into Completed section          |
| 2    | HomeScreen | —                                 | Habit card now shows in Completed section with a checked state |

**Success outcome:** Habit marked complete, visible in Completed section.
**Failure paths:**

-   User taps checkbox again (untick) → habit moves back to Incomplete section; log entry removed for today

---

### Flow 4: Log a numeric habit without a target (manual complete)

> **Goal:** User logs their investment amount for the day, then marks it done
> **Entry point:** HomeScreen, habit card

| Step | Screen            | User Action                        | App Response                                      |
| ---- | ----------------- | ---------------------------------- | ------------------------------------------------- |
| 1    | HomeScreen        | Taps the investment habit card     | Navigates to HabitDetailScreen                    |
| 2    | HabitDetailScreen | Taps the number input, types "500" | Value set to 500 (unit: "dollars")                |
| 3    | HabitDetailScreen | Taps "Mark as done"                | Habit flagged as manually completed for today     |
| 4    | HabitDetailScreen | Taps back                          | Returns to HomeScreen; habit in Completed section |

**Success outcome:** Value logged, habit in Completed section.

---

### Flow 5: View habit history and streaks

> **Goal:** User checks how consistently they've been drinking water this month
> **Entry point:** HomeScreen → tap habit card

| Step | Screen            | User Action                    | App Response                                                 |
| ---- | ----------------- | ------------------------------ | ------------------------------------------------------------ |
| 1    | HomeScreen        | Taps the water habit card      | Navigates to HabitDetailScreen                               |
| 2    | HabitDetailScreen | Scrolls down past logging area | Sees streak stats (e.g. "10 day streak · best: 17 days")     |
| 3    | HabitDetailScreen | Views calendar history         | Calendar shows colour-coded days from creation date to today |
| 4    | HabitDetailScreen | Scrolls calendar back          | Views previous months; days before creation date not shown   |
| 5    | HabitDetailScreen | Scrolls past calendar          | Sees past values log: list of entries with date and value    |

**Success outcome:** User has a clear picture of their history and consistency.

---

### Flow 6: Delete a habit

> **Goal:** User removes a habit they no longer want to track
> **Entry point:** HomeScreen → long press → Edit, or HabitDetailScreen → edit icon

| Step | Screen            | User Action                    | App Response                                                          |
| ---- | ----------------- | ------------------------------ | --------------------------------------------------------------------- |
| 1    | HabitDetailScreen | Taps settings icon (top right) | Navigates to EditHabitScreen                                          |
| 2    | EditHabitScreen   | Taps "Delete habit"            | Confirmation dialog: "Delete this habit? All log data will be lost."  |
| 3    | EditHabitScreen   | Confirms deletion              | Habit and all logs deleted from local DB; user returned to HomeScreen |

**Success outcome:** Habit and all its data are removed.
**Failure paths:**

-   User cancels deletion → no changes made, returns to EditHabitScreen

---

## 8. Data Model

### Entities

| Entity     | Key Fields                                                                                                  | Notes                                                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `Habit`    | `id`, `name`, `icon`, `colour`, `trackingType`, `unit`, `targetValue`, `targetPeriod`, `notes`, `createdAt` | `unit` only relevant for numeric. `targetValue` + `targetPeriod` are nullable.                                                          |
| `HabitLog` | `id`, `habitId`, `date`, `value`, `isManuallyCompleted`, `loggedAt`                                         | `date` is YYYY-MM-DD. `value` is a number (0 or 1 for checkbox habits). `isManuallyCompleted` used for numeric habits without a target. |

### Relationships

-   `Habit` has many `HabitLog` entries
-   `HabitLog` belongs to one `Habit`
-   When a `Habit` is deleted, all its `HabitLog` entries are deleted (cascade)

### Field details

**Habit.trackingType:** `'numeric' | 'checkbox'`
**Habit.targetPeriod:** `'daily' | 'weekly' | 'monthly' | null`
**HabitLog.value:**

-   For checkbox habits: `1` (done) or `0` (not done — though typically we only insert a log when done)
-   For numeric habits: the actual logged number (e.g. `9` for glasses of water)

### Completion logic (derived, not stored)

A habit is considered "completed today" when:

-   **Checkbox:** A `HabitLog` exists for today's date with `value = 1`
-   **Numeric with target (daily):** Today's `HabitLog.value >= Habit.targetValue`
-   **Numeric with target (weekly):** Sum of `HabitLog.value` for current week `>= Habit.targetValue`
-   **Numeric with target (monthly):** Sum of `HabitLog.value` for current month `>= Habit.targetValue`
-   **Numeric without target:** A `HabitLog` exists for today with `isManuallyCompleted = true`

### Streak logic

-   **Daily habits:** Count consecutive calendar days (going back from today) where the habit was completed
-   **Weekly habits:** Count consecutive calendar weeks where the weekly target was met
-   **Monthly habits:** Count consecutive calendar months where the monthly target was met
-   **No target (numeric):** Count consecutive days where any value was logged

---

## 9. Integrations & Services

None for MVP. The app is fully self-contained with local storage only.

| Integration | Status       | Notes                    |
| ----------- | ------------ | ------------------------ |
| Local DB    | In scope     | SQLite via `expo-sqlite` |
| Widgets     | Out of scope |                          |
| Data export | Out of scope |                          |
| Cloud sync  | Out of scope | No accounts in scope     |

---

## 10. Design Direction

-   **Visual style:** Clean and minimal — generous whitespace, calm colour palette, understated typography. Inspired by the reference design shared: large type, subtle card backgrounds, circular calendar dots.
-   **Design system:** Custom from scratch — lean and purpose-built for this app's aesthetic
-   **Colour mood:** Neutral base (white/near-white in light mode, near-black in dark mode) with soft accent colours chosen per habit. The app's own chrome is mostly monochrome; colour comes from the habits themselves.
-   **Typography feel:** Large, confident type for key numbers and labels (as in the reference). System fonts preferred for performance (SF Pro on iOS, Roboto on Android), or a clean sans-serif like Inter.
-   **Dark mode:** Full support, follows system setting
-   **Animation / motion:** Subtle — e.g. habit card sliding from incomplete to completed section when done; counter incrementing with a small bounce
-   **Brand references:** The reference design shared in the planning session — typographic, calm, minimal

---

## 11. MVP Scope

### In scope for v1

-   Create habits: name, icon, colour, tracking type (numeric / checkbox), unit (numeric), optional target (daily/weekly/monthly), notes
-   Log habits: numeric counter (text input + +/− buttons) or checkbox
-   Home dashboard: header with time-of-day greeting, incomplete habits, completed habits
-   Habit detail: counter/checkbox, target progress, streak stats, calendar history, past values log
-   Edit habits: all fields editable
-   Delete habits: with confirmation and cascade log deletion
-   Manual completion: "Mark as done" for numeric habits without a target
-   Auto-completion: move to Completed when numeric target is reached, or checkbox is ticked
-   Long press on home screen card → context menu (Edit, Delete)
-   Full local data persistence

### Explicitly out of scope

-   Social features of any kind (sharing, friends, leaderboards)
-   Gamification (points, badges, levels, streaks as a game mechanic)
-   AI suggestions, insights, or nudges
-   Push notifications / reminders
-   Subscription model or paywall
-   Cloud sync, backups, or user accounts
-   Web version

---

## 12. Open Questions

All open questions resolved. No outstanding decisions.

---

## 13. Revision History

| Date       | Change        | Author     |
| ---------- | ------------- | ---------- |
| 2026-03-05 | Initial draft | PM session |
