use serde::{Deserialize, Serialize};

// Chess.com API models
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChessComPlayer {
    pub username: String,
    pub rating: Option<u32>,
    pub result: String,
    #[serde(rename = "@id")]
    pub id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChessComGame {
    pub url: String,
    pub pgn: Option<String>,
    pub time_control: Option<String>,
    pub end_time: Option<u64>,
    pub rated: Option<bool>,
    pub time_class: Option<String>,
    pub rules: Option<String>,
    pub white: ChessComPlayer,
    pub black: ChessComPlayer,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChessComGamesResponse {
    pub games: Vec<ChessComGame>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChessComArchivesResponse {
    pub archives: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChessComProfile {
    pub username: Option<String>,
    pub player_id: Option<u64>,
    pub title: Option<String>,
    pub status: Option<String>,
    pub name: Option<String>,
    pub avatar: Option<String>,
    pub location: Option<String>,
    pub country: Option<String>,
    pub joined: Option<u64>,
    pub last_online: Option<u64>,
    pub followers: Option<u32>,
    pub is_streamer: Option<bool>,
    pub url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChessComStats {
    pub chess_rapid: Option<RatingInfo>,
    pub chess_blitz: Option<RatingInfo>,
    pub chess_bullet: Option<RatingInfo>,
    pub chess_daily: Option<RatingInfo>,
    pub tactics: Option<TacticsInfo>,
    pub puzzle_rush: Option<PuzzleRushInfo>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RatingInfo {
    pub last: Option<RatingRecord>,
    pub best: Option<RatingRecord>,
    pub record: Option<WinLossRecord>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RatingRecord {
    pub rating: Option<u32>,
    pub date: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WinLossRecord {
    pub win: Option<u32>,
    pub loss: Option<u32>,
    pub draw: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TacticsInfo {
    pub highest: Option<RatingRecord>,
    pub lowest: Option<RatingRecord>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PuzzleRushInfo {
    pub best: Option<PuzzleRushBest>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PuzzleRushBest {
    pub total_attempts: Option<u32>,
    pub score: Option<u32>,
}

// Application models
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GameAnalysis {
    pub game_url: String,
    pub white: String,
    pub black: String,
    pub result: String,
    pub time_control: String,
    pub time_class: String,
    pub date: String,
    pub pgn: String,
    pub moves: Vec<MoveAnalysis>,
    pub summary: GameSummary,
    #[serde(default)]
    pub key_moments: Vec<KeyMoment>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KeyMoment {
    pub move_index: usize,
    pub move_number: u32,
    pub san: String,
    pub color: String,
    pub classification: String,
    pub description: String,
    pub severity: String, // "critical", "major", "notable"
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MoveAnalysis {
    pub move_number: u32,
    pub san: String,
    pub color: String,
    pub classification: MoveClassification,
    pub comment: Option<String>,
    pub is_book_move: bool,
    pub fen_after: String,
    // Arrow data for board visualization
    pub played_from: Option<String>,
    pub played_to: Option<String>,
    pub best_move_san: Option<String>,
    pub best_from: Option<String>,
    pub best_to: Option<String>,
    pub fen_before: String,
    #[serde(default)]
    pub eval_score: f64, // centipawns, positive = white advantage
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum MoveClassification {
    Brilliant,
    Great,
    Best,
    Good,
    Book,
    Inaccuracy,
    Mistake,
    Blunder,
    ForcedMove,
}

impl MoveClassification {
    pub fn label(&self) -> &str {
        match self {
            Self::Brilliant => "Brilliant",
            Self::Great => "Great",
            Self::Best => "Best",
            Self::Good => "Good",
            Self::Book => "Book",
            Self::Inaccuracy => "Inaccuracy",
            Self::Mistake => "Mistake",
            Self::Blunder => "Blunder",
            Self::ForcedMove => "Forced",
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GameSummary {
    pub total_moves: u32,
    pub brilliancies: u32,
    pub great_moves: u32,
    pub best_moves: u32,
    pub good_moves: u32,
    pub inaccuracies: u32,
    pub mistakes: u32,
    pub blunders: u32,
    pub accuracy: f64,
    pub opening_name: Option<String>,
}

// Opening models
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Opening {
    pub eco: String,
    pub name: String,
    pub pgn: String,
    pub moves: Vec<String>,
    pub category: OpeningCategory,
    pub description: String,
    pub key_ideas: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum OpeningCategory {
    KingPawn,
    QueenPawn,
    Flank,
    Indian,
    SemiOpen,
}

// Lesson models
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Lesson {
    pub id: String,
    pub title: String,
    pub category: LessonCategory,
    pub difficulty: Difficulty,
    pub description: String,
    pub content: Vec<LessonSection>,
    pub completed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum LessonCategory {
    Opening,
    Middlegame,
    Endgame,
    Tactics,
    Strategy,
    Positional,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Difficulty {
    Beginner,
    Intermediate,
    Advanced,
    Expert,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LessonSection {
    pub title: String,
    pub content: String,
    pub fen: Option<String>,
    pub moves: Option<Vec<String>>,
}
