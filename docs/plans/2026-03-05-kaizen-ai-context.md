# Kaizen — AI Coding Context

> This document is a reference for an AI coding assistant implementing Kaizen.
> Full product detail is in: `2026-03-05-kaizen-prd.md`
> Generated: 2026-03-05

---

## Project Identity

- **App:** Kaizen — a fully customisable habit tracker
- **Platform:** React Native (Expo) — iOS + Android
- **Auth:** None — no accounts, no login
- **Backend:** Local only — SQLite via `expo-sqlite`
- **Offline:** Always offline — the app has no network dependency

---

## Scope Guardrails

Implement **only** what is listed in this document and the PRD. Do not add features, screens, or flows not listed here without explicit user confirmation.

**Explicitly out of scope — do not implement:**
- Social features (sharing, friends, leaderboards)
- Gamification (points, badges, levels)
- AI features of any kind
- Push notifications or reminders
- Cloud sync, backups, or user accounts
- Subscription or paywall
- Data export
- Pinned habits section on HomeScreen
- Web support

---

## Navigation Architecture

**Pattern:** Stack only — no bottom tab bar, no drawer.

```
RootStack (Stack Navigator)
├── HomeScreen                  ← initial route
├── HabitDetailScreen           ← params: { habitId: string }
├── CreateHabitScreen           ← no params
└── EditHabitScreen             ← params: { habitId: string }
```

---

## Screen List (MVP only)

| Screen              | Component name          | Route name          | Notes                                      |
| ------------------- | ----------------------- | ------------------- | ------------------------------------------ |
| Home / Dashboard    | `HomeScreen`            | `Home`              | Default screen                             |
| Habit Detail        | `HabitDetailScreen`     | `HabitDetail`       | Receives `habitId`                         |
| Create Habit        | `CreateHabitScreen`     | `CreateHabit`       | Opened via `+` on HomeScreen               |
| Edit Habit          | `EditHabitScreen`       | `EditHabit`         | Receives `habitId`; same form as Create    |

---

## Component Inventory

Build these as shared, reusable components before implementing screens.

### Base / UI components

| Component           | Props (key)                                                                             | Notes                                          |
| ------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `Button`            | `variant` (`primary` \| `secondary` \| `destructive`), `onPress`, `loading?`, `label` | Covers all CTA styles                          |
| `Input`             | `label?`, `value`, `onChangeText`, `error?`, `multiline?`, `keyboardType?`             |                                                |
| `EmptyState`        | `title`, `message`, `ctaLabel?`, `onCta?`                                              | Used on HomeScreen when no habits exist        |
| `ConfirmDialog`     | `visible`, `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`                 | Used for delete confirmation                   |
| `SectionHeader`     | `label`                                                                                 | "Incomplete" / "Completed" section labels      |
| `IconPicker`        | `selected`, `onSelect`                                                                  | Scrollable row/grid of preset icons            |
| `ColourPicker`      | `selected`, `onSelect`                                                                  | Row of preset colour swatches                  |
| `SegmentedControl`  | `options: string[]`, `selected`, `onSelect`                                            | Used for tracking type and period selectors    |
| `CalendarGrid`      | `month: string` (YYYY-MM), `logs: HabitLog[]`, `createdAt`, `targetValue?`, `trackingType` | Single month calendar grid — reused in both inline and bottom sheet contexts |
| `CalendarHistorySheet` | `visible`, `onClose`, `habitId`, `createdAt`, `logs: HabitLog[]`, `targetValue?`, `trackingType` | Bottom sheet with two snap points (mid, full); scrollable list of `CalendarGrid` components |
| `StatBlock`         | `label`, `value`                                                                        | E.g. "12 day streak", "best: 30 days"         |
| `PastValuesLog`     | `logs: HabitLog[]`, `unit?`                                                            | Chronological list of log entries              |

### App-specific components

| Component           | Used on              | Notes                                                                                                |
| ------------------- | -------------------- | ---------------------------------------------------------------------------------------------------- |
| `HabitCard`         | HomeScreen           | Shows habit name, icon, colour, tracking type indicator, progress, quick log controls (see below)    |
| `NumericLogger`     | HabitDetailScreen    | Large central text input + `−` button left + `+` button right; tapping number opens keyboard        |
| `CheckboxLogger`    | HabitDetailScreen    | Large tappable checkbox with "Done for today" label                                                  |
| `TargetPicker`      | CreateHabitScreen, EditHabitScreen | Collapsible section: numeric input + Daily/Weekly/Monthly period selector     |

---

## HabitCard Detail

The `HabitCard` is the core interactive unit on HomeScreen.

**Layout:**
- Left: habit icon (coloured, using the habit's chosen colour)
- Centre: habit name, progress label (e.g. "9 / 10 glasses" or unchecked/checked state)
- Right (numeric): `−` and `+` buttons for quick inline logging
- Right (checkbox): tappable checkbox

**Interactions:**
- Tap card body → navigate to `HabitDetailScreen`
- Tap `+` → increment today's value by 1; if target reached, move card to Completed section
- Tap `−` → decrement today's value by 1 (floor at 0)
- Tap checkbox → toggle; if ticked, move to Completed section; if unticked, move back to Incomplete
- Long press → show context menu with "Edit" and "Delete" options

---

## NumericLogger Detail

Used on `HabitDetailScreen` for numeric habits.

**Layout:**
```
[ − ]   [ large text input showing today's value ]   [ + ]
              "of {targetValue} {unit} / {period}"
                       (shown if target is set)
```

- The number input is a large, centred, editable text field (keyboard type: numeric)
- Tapping the number opens the numeric keyboard
- `+` increments the stored value by 1
- `−` decrements the stored value by 1 (floor at 0)
- On change, persist immediately to local DB

---

## CalendarGrid Detail

Used both inline on `HabitDetailScreen` and inside `CalendarHistorySheet`.

**Props:**
```ts
type CalendarGridProps = {
  month: string;           // YYYY-MM
  logs: HabitLog[];
  createdAt: string;       // ISO date — days before this are not rendered
  targetValue?: number;
  trackingType: 'numeric' | 'checkbox';
  displayMode: 'value' | 'date';  // controlled by parent toggle
}
```

**Day states — definitive spec:**

| State                              | Visual                                                               |
| ---------------------------------- | -------------------------------------------------------------------- |
| Future date                        | Greyed-out circle; not interactive                                   |
| Empty (no value logged, or 0)      | No border, no fill — completely blank                                |
| Partially met (numeric with target)| Partial arc border only (no fill). Arc length = `loggedValue / targetValue`. E.g. 4/8 = 180° arc (50%) |
| Fully met (target reached / checkbox ticked) | Fully filled circle in the habit's accent colour          |
| Today                              | Solid filled black circle (light mode) / white circle (dark mode), regardless of progress state |
| Before creation date               | Not rendered                                                         |

**Label inside circle (display mode toggle):**
- **`value` mode (default):** Show the logged value for that day, formatted compactly (e.g. `10.5K` for 10500, `8K` for 8000, `30` for 30). Blank for empty days.
- **`date` mode:** Show the calendar date number (1–31).
- Checkbox habits: no label shown in either mode — circle state only.

**Implementation note:**
- Use SVG (via `react-native-svg`) to draw the partial arc. The arc is a `stroke`-only path; no fill until fully met.
- Arc starts at the top (−90°) and sweeps clockwise.
- Tapping any day does nothing (view only in MVP)

## CalendarHistorySheet Detail

A bottom sheet opened from `HabitDetailScreen` via the expand button on the inline calendar.

- **Snap points:** Two — mid-screen (default open position) and full-screen (top)
- **Content:** Vertically scrollable list of `CalendarGrid` components, one per month from the habit's creation month to the current month, ordered most recent first
- **Display mode toggle:** The same `value` / `date` toggle from the inline calendar header is mirrored inside the sheet header. The `displayMode` state is lifted to `HabitDetailScreen` so both the inline grid and the sheet share the same toggle state
- **Dismissal:** Drag down past the mid snap point, or tap the backdrop
- **Library:** Use `@gorhom/bottom-sheet` (supports snap points and gesture handling)

---

## Data Entities

| Entity       | Fields                                                                                                                                          | Storage     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `Habit`      | `id: string` (uuid), `name: string`, `icon: string`, `colour: string`, `trackingType: 'numeric' \| 'checkbox'`, `unit: string \| null`, `targetValue: number \| null`, `targetPeriod: 'daily' \| 'weekly' \| 'monthly' \| null`, `notes: string \| null`, `createdAt: string` (ISO date) | SQLite      |
| `HabitLog`   | `id: string` (uuid), `habitId: string`, `date: string` (YYYY-MM-DD), `value: number`, `isManuallyCompleted: boolean`, `loggedAt: string` (ISO timestamp) | SQLite      |
| `AppSettings`| `calendarDisplayMode: 'value' \| 'date'`                                                                                                        | MMKV — UI preferences only |

---

## Completion Logic (implement as pure utility functions)

```ts
// Is a habit completed for a given reference date?
function isHabitCompletedOn(habit: Habit, logs: HabitLog[], date: string): boolean

// For checkbox habits:
//   → true if a log exists for date with value === 1

// For numeric habits with a daily target:
//   → true if the log for date has value >= habit.targetValue

// For numeric habits with a weekly target:
//   → true if sum of values for the week containing date >= habit.targetValue

// For numeric habits with a monthly target:
//   → true if sum of values for the month containing date >= habit.targetValue

// For numeric habits with NO target:
//   → true if a log for date exists with isManuallyCompleted === true
```

---

## Streak Logic (implement as pure utility functions)

```ts
// Returns { currentStreak: number, bestStreak: number }
function calculateStreaks(habit: Habit, logs: HabitLog[]): { currentStreak: number; bestStreak: number }

// For daily habits: count consecutive completed days going backwards from today
// For weekly habits: count consecutive completed weeks going backwards from current week
// For monthly habits: count consecutive completed months going backwards from current month
// For no-target numeric habits: count consecutive days with any log entry
```

---

## Local Database Schema

Use `expo-sqlite` with a migrations approach.

```sql
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  colour TEXT NOT NULL,
  tracking_type TEXT NOT NULL CHECK(tracking_type IN ('numeric', 'checkbox')),
  unit TEXT,
  target_value REAL,
  target_period TEXT CHECK(target_period IN ('daily', 'weekly', 'monthly')),
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  value REAL NOT NULL DEFAULT 0,
  is_manually_completed INTEGER NOT NULL DEFAULT 0,
  logged_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
```

---

## State Management

**Approach:** Zustand for global UI/app state + direct SQLite queries for data access (no ORM).

| Store          | Holds                                                              | Notes                                           |
| -------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| `useHabitStore`| `habits: Habit[]`, CRUD actions (`addHabit`, `updateHabit`, `deleteHabit`, `loadHabits`) | Synced with SQLite on load and after mutations  |
| `useLogStore`  | `logs: HabitLog[]` for today, log actions (`logValue`, `toggleCheckbox`, `markManuallyComplete`) | Loaded fresh on HomeScreen mount               |
| `useSettingsStore` | `calendarDisplayMode: 'value' \| 'date'`, `setCalendarDisplayMode` | Persisted to MMKV                         |

---

## HomeScreen Data Loading

On mount, HomeScreen should:
1. Load all habits from `useHabitStore` (sorted by `sortOrder`)
2. Load today's logs for all habits
3. Derive completed vs incomplete list using the completion logic utilities
4. Split into two sections: Incomplete (top), Completed (bottom)

The home screen should re-derive sections reactively when a log action is performed inline.

---

## Third-party Integrations (MVP)

| Integration       | Package                                                        | Purpose                        | Notes                                     |
| ----------------- | -------------------------------------------------------------- | ------------------------------ | ----------------------------------------- |
| Local database    | `expo-sqlite`                                                  | Persist habits + logs          | Use WAL mode for performance              |
| Settings storage  | `react-native-mmkv`                                            | Persist UI preferences         | Requires dev client / local build         |
| Unique IDs        | `expo-crypto`                                                  | Generate habit and log IDs     |                                           |
| State management  | `zustand`                                                      | App-wide state                 |                                           |
| Navigation        | `@react-navigation/native` + `@react-navigation/native-stack`  | Stack navigation               |                                           |
| Icons             | `@expo/vector-icons`                                           | Habit icons                    | Bundled with Expo; no extra install needed|
| SVG / arc drawing | `react-native-svg`                                             | Calendar partial arc circles   | Required for progress arc rendering       |
| Bottom sheet      | `@gorhom/bottom-sheet`                                         | Calendar history sheet         | Snap points: mid + full                   |
| Colours           | 12 preset swatches                                             | Habit card theming             | Define as a constant array in the codebase|

---

## Screen States

Every screen must handle:

- **Loading** — show a neutral loading state while reading from SQLite
- **Error** — surface any DB errors clearly (rare but handle gracefully)
- **Empty** — HomeScreen with no habits shows a friendly empty state with a CTA to create the first habit
- **Default** — the main happy-path content

---

## Key Constraints

1. **No network calls.** The app must never make a network request. All data is local.
2. **Cascade delete.** Deleting a habit must delete all its `HabitLog` entries. Enforce at the DB level with `ON DELETE CASCADE`.
3. **Tracking type change warning.** If the user changes `trackingType` on an existing habit (numeric ↔ checkbox), show a warning that all existing logs will be cleared, then delete those logs before saving.
4. **Date handling.** Always use the device's local date (YYYY-MM-DD) for log entries — never UTC. Use a consistent date utility across the app.
5. **Value floor.** Numeric values must never go below 0 — clamp on `−` button press.
6. **Name required.** The habit name is the only required field. Block save if empty and show an inline error.
7. **Completion is derived, not stored.** Do not add a "completed" field to the `habits` table. Always derive completion state from logs at query time.
8. **Past log values are read-only in MVP.** The past values log and calendar are view-only. Editing past entries is not in scope.
9. **One log entry per day per habit.** For numeric habits, `habit_logs` should upsert (insert or update) — only one log row per `(habit_id, date)` pair. For checkbox habits, same: one row per day.
10. **Period-aware progress.** For weekly/monthly targets, progress labels on the card and detail screen must sum logs across the full period, not just today.
