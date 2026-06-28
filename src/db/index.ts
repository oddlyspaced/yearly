import * as SQLite from 'expo-sqlite';

import { Entry, Goal } from '@/domain/types';

const db = SQLite.openDatabaseSync('kaizen.db');

/** Create tables on first launch. Idempotent. */
export function initDb(): void {
	db.execSync(`
		PRAGMA journal_mode = WAL;
		PRAGMA foreign_keys = ON;

		CREATE TABLE IF NOT EXISTS goals (
			id TEXT PRIMARY KEY NOT NULL,
			name TEXT NOT NULL,
			type TEXT NOT NULL,
			unit TEXT,
			period TEXT NOT NULL,
			aggregation TEXT NOT NULL,
			comparator TEXT NOT NULL,
			target_value REAL,
			icon TEXT NOT NULL,
			color TEXT NOT NULL,
			sort_order INTEGER NOT NULL DEFAULT 0,
			archived INTEGER NOT NULL DEFAULT 0,
			created_at TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS entries (
			id TEXT PRIMARY KEY NOT NULL,
			goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
			date TEXT NOT NULL,
			value REAL NOT NULL DEFAULT 0,
			state TEXT NOT NULL DEFAULT 'logged',
			logged_at TEXT NOT NULL,
			UNIQUE (goal_id, date)
		);

		CREATE INDEX IF NOT EXISTS idx_entries_goal ON entries(goal_id);
		CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
	`);
}

// ── Row mapping ─────────────────────────────────────────────────────────────

interface GoalRow {
	id: string;
	name: string;
	type: string;
	unit: string | null;
	period: string;
	aggregation: string;
	comparator: string;
	target_value: number | null;
	icon: string;
	color: string;
	sort_order: number;
	archived: number;
	created_at: string;
}

interface EntryRow {
	id: string;
	goal_id: string;
	date: string;
	value: number;
	state: string;
	logged_at: string;
}

const toGoal = (r: GoalRow): Goal => ({
	id: r.id,
	name: r.name,
	type: r.type as Goal['type'],
	unit: r.unit,
	period: r.period as Goal['period'],
	aggregation: r.aggregation as Goal['aggregation'],
	comparator: r.comparator as Goal['comparator'],
	targetValue: r.target_value,
	icon: r.icon,
	color: r.color,
	sortOrder: r.sort_order,
	archived: r.archived === 1,
	createdAt: r.created_at,
});

const toEntry = (r: EntryRow): Entry => ({
	id: r.id,
	goalId: r.goal_id,
	date: r.date,
	value: r.value,
	state: r.state as Entry['state'],
	loggedAt: r.logged_at,
});

// ── Queries ─────────────────────────────────────────────────────────────────

export function selectGoals(): Goal[] {
	return db
		.getAllSync<GoalRow>(
			'SELECT * FROM goals ORDER BY sort_order ASC, created_at ASC',
		)
		.map(toGoal);
}

export function selectEntries(): Entry[] {
	return db.getAllSync<EntryRow>('SELECT * FROM entries').map(toEntry);
}

export function insertGoal(g: Goal): void {
	db.runSync(
		`INSERT INTO goals (id, name, type, unit, period, aggregation, comparator, target_value, icon, color, sort_order, archived, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			g.id,
			g.name,
			g.type,
			g.unit,
			g.period,
			g.aggregation,
			g.comparator,
			g.targetValue,
			g.icon,
			g.color,
			g.sortOrder,
			g.archived ? 1 : 0,
			g.createdAt,
		],
	);
}

export function updateGoalRow(g: Goal): void {
	db.runSync(
		`UPDATE goals SET name=?, type=?, unit=?, period=?, aggregation=?, comparator=?, target_value=?, icon=?, color=?, sort_order=?, archived=? WHERE id=?`,
		[
			g.name,
			g.type,
			g.unit,
			g.period,
			g.aggregation,
			g.comparator,
			g.targetValue,
			g.icon,
			g.color,
			g.sortOrder,
			g.archived ? 1 : 0,
			g.id,
		],
	);
}

export function deleteGoalRow(id: string): void {
	db.runSync('DELETE FROM goals WHERE id = ?', [id]);
}

/** Insert or update the single entry for (goalId, date). */
export function upsertEntry(e: Entry): void {
	db.runSync(
		`INSERT INTO entries (id, goal_id, date, value, state, logged_at)
		 VALUES (?, ?, ?, ?, ?, ?)
		 ON CONFLICT(goal_id, date) DO UPDATE SET value=excluded.value, state=excluded.state, logged_at=excluded.logged_at`,
		[e.id, e.goalId, e.date, e.value, e.state, e.loggedAt],
	);
}

export function deleteEntryFor(goalId: string, date: string): void {
	db.runSync('DELETE FROM entries WHERE goal_id = ? AND date = ?', [
		goalId,
		date,
	]);
}

export function deleteEntriesForGoal(goalId: string): void {
	db.runSync('DELETE FROM entries WHERE goal_id = ?', [goalId]);
}
