import { invoke } from "@tauri-apps/api/core";

// Types matching Rust models
export interface ChessComPlayer {
    username: string;
    rating?: number;
    result: string;
}

export interface ChessComGame {
    url: string;
    pgn?: string;
    time_control?: string;
    end_time?: number;
    rated?: boolean;
    time_class?: string;
    rules?: string;
    white: ChessComPlayer;
    black: ChessComPlayer;
}

export interface ChessComProfile {
    username?: string;
    player_id?: number;
    title?: string;
    status?: string;
    name?: string;
    avatar?: string;
    location?: string;
    country?: string;
    joined?: number;
    last_online?: number;
    followers?: number;
    is_streamer?: boolean;
    url?: string;
}

export interface RatingRecord {
    rating?: number;
    date?: number;
}

export interface WinLossRecord {
    win?: number;
    loss?: number;
    draw?: number;
}

export interface RatingInfo {
    last?: RatingRecord;
    best?: RatingRecord;
    record?: WinLossRecord;
}

export interface TacticsInfo {
    highest?: RatingRecord;
    lowest?: RatingRecord;
}

export interface PuzzleRushBest {
    total_attempts?: number;
    score?: number;
}

export interface PuzzleRushInfo {
    best?: PuzzleRushBest;
}

export interface ChessComStats {
    chess_rapid?: RatingInfo;
    chess_blitz?: RatingInfo;
    chess_bullet?: RatingInfo;
    chess_daily?: RatingInfo;
    tactics?: TacticsInfo;
    puzzle_rush?: PuzzleRushInfo;
}

export interface MoveAnalysis {
    move_number: number;
    san: string;
    color: string;
    classification: string;
    comment?: string;
    is_book_move: boolean;
    fen_after: string;
    played_from?: string;
    played_to?: string;
    best_move_san?: string;
    best_from?: string;
    best_to?: string;
    fen_before: string;
    eval_score: number;
}

export interface GameSummary {
    total_moves: number;
    brilliancies: number;
    great_moves: number;
    best_moves: number;
    good_moves: number;
    inaccuracies: number;
    mistakes: number;
    blunders: number;
    accuracy: number;
    opening_name?: string;
}

export interface GameAnalysis {
    game_url: string;
    white: string;
    black: string;
    result: string;
    time_control: string;
    time_class: string;
    date: string;
    pgn: string;
    moves: MoveAnalysis[];
    summary: GameSummary;
    key_moments: KeyMoment[];
}

export interface KeyMoment {
    move_index: number;
    move_number: number;
    san: string;
    color: string;
    classification: string;
    description: string;
    severity: string;
}

export interface Opening {
    eco: string;
    name: string;
    pgn: string;
    moves: string[];
    category: string;
    description: string;
    key_ideas: string[];
}

export interface LessonSection {
    title: string;
    content: string;
    fen?: string;
    moves?: string[];
}

export interface Lesson {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    description: string;
    content: LessonSection[];
    completed: boolean;
}

// API Functions
export async function fetchProfile(username: string): Promise<ChessComProfile> {
    return invoke("fetch_profile", { username });
}

export async function fetchStats(username: string): Promise<ChessComStats> {
    return invoke("fetch_stats", { username });
}

export async function fetchRecentGames(
    username: string,
    limit: number
): Promise<ChessComGame[]> {
    return invoke("fetch_recent_games", { username, limit });
}

export async function getSavedGames(
    username: string,
    limit: number
): Promise<ChessComGame[]> {
    return invoke("get_saved_games", { username, limit });
}

export async function getGameCount(username: string): Promise<number> {
    return invoke("get_game_count", { username });
}

export async function analyzeGame(
    pgn: string,
    white: string,
    black: string,
    result: string,
    timeControl: string,
    timeClass: string,
    gameUrl: string,
    endTime: number
): Promise<GameAnalysis> {
    return invoke("analyze_game_cmd", {
        pgn,
        white,
        black,
        result,
        timeControl,
        timeClass,
        gameUrl,
        endTime,
    });
}

export async function getOpenings(category?: string): Promise<Opening[]> {
    return invoke("get_openings", { category: category || null });
}

export async function getLessons(category?: string): Promise<Lesson[]> {
    return invoke("get_lessons", { category: category || null });
}

export async function getSetting(key: string): Promise<string | null> {
    return invoke("get_setting", { key });
}

export async function setSetting(key: string, value: string): Promise<void> {
    return invoke("set_setting", { key, value });
}

export async function getCoachComment(
    gameUrl: string,
    moveIndex: number,
    fen: string,
    playedMove: string,
    bestMove: string | null,
    classification: string,
    color: string,
    moveNumber: number
): Promise<string> {
    return invoke("get_coach_comment", {
        gameUrl,
        moveIndex,
        fen,
        playedMove,
        bestMove,
        classification,
        color,
        moveNumber,
    });
}
