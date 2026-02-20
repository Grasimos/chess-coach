mod models;
mod chess_com;
mod analysis;
mod openings;
mod lessons;
mod db;
mod coach;

use chess_com::ChessComClient;
use db::Database;
use models::*;
use std::sync::Arc;
use tauri::Manager;

struct AppState {
    db: Arc<Database>,
}

#[tauri::command]
async fn fetch_profile(username: String) -> Result<ChessComProfile, String> {
    let client = ChessComClient::new();
    client.get_profile(&username).await
}

#[tauri::command]
async fn fetch_stats(username: String) -> Result<ChessComStats, String> {
    let client = ChessComClient::new();
    client.get_stats(&username).await
}

#[tauri::command]
async fn fetch_recent_games(
    state: tauri::State<'_, AppState>,
    username: String,
    limit: usize,
) -> Result<Vec<ChessComGame>, String> {
    let client = ChessComClient::new();

    // Get the latest game time we have stored
    let latest_time = state.db.get_latest_end_time(&username)?;

    // Fetch new games from chess.com
    let new_games = client.get_recent_games(&username, limit).await?;

    // Filter to only truly new games (after our latest stored game)
    let games_to_save: Vec<ChessComGame> = if let Some(latest) = latest_time {
        new_games
            .iter()
            .filter(|g| g.end_time.unwrap_or(0) > latest)
            .cloned()
            .collect()
    } else {
        new_games.clone()
    };

    // Save new games to database
    if !games_to_save.is_empty() {
        let saved = state.db.save_games(&username, &games_to_save)?;
        eprintln!("Saved {} new games for {}", saved, username);
    }

    // Return all games from database (most comprehensive + sorted)
    state.db.get_saved_games(&username, limit)
}

#[tauri::command]
async fn get_saved_games(
    state: tauri::State<'_, AppState>,
    username: String,
    limit: usize,
) -> Result<Vec<ChessComGame>, String> {
    state.db.get_saved_games(&username, limit)
}

#[tauri::command]
async fn get_game_count(
    state: tauri::State<'_, AppState>,
    username: String,
) -> Result<usize, String> {
    state.db.get_game_count(&username)
}

#[tauri::command]
async fn analyze_game_cmd(
    state: tauri::State<'_, AppState>,
    pgn: String,
    white: String,
    black: String,
    result: String,
    time_control: String,
    time_class: String,
    game_url: String,
    end_time: u64,
) -> Result<GameAnalysis, String> {
    // Check if we have cached analysis
    if let Ok(Some(cached_json)) = state.db.get_analysis(&game_url) {
        if let Ok(cached) = serde_json::from_str::<GameAnalysis>(&cached_json) {
            return Ok(cached);
        }
    }

    // Perform analysis
    let analysis = analysis::analyze_game(
        &pgn, &white, &black, &result, &time_control, &time_class, &game_url, end_time,
    )?;

    // Cache the analysis
    if let Ok(json) = serde_json::to_string(&analysis) {
        let _ = state.db.save_analysis(&game_url, &json);
    }

    Ok(analysis)
}

#[tauri::command]
fn get_openings(category: Option<String>) -> Vec<Opening> {
    match category {
        Some(cat) => openings::get_openings_by_category(&cat),
        None => openings::get_all_openings(),
    }
}

#[tauri::command]
fn get_lessons(category: Option<String>) -> Vec<Lesson> {
    match category {
        Some(cat) => lessons::get_lessons_by_category(&cat),
        None => lessons::get_all_lessons(),
    }
}

#[tauri::command]
async fn get_setting(
    state: tauri::State<'_, AppState>,
    key: String,
) -> Result<Option<String>, String> {
    state.db.get_setting(&key)
}

#[tauri::command]
async fn set_setting(
    state: tauri::State<'_, AppState>,
    key: String,
    value: String,
) -> Result<(), String> {
    state.db.set_setting(&key, &value)
}

#[tauri::command]
async fn get_coach_comment(
    state: tauri::State<'_, AppState>,
    game_url: String,
    move_index: usize,
    fen: String,
    played_move: String,
    best_move: Option<String>,
    classification: String,
    color: String,
    move_number: u32,
) -> Result<String, String> {
    // Check cache first
    if let Ok(Some(cached)) = state.db.get_coach_comment(&game_url, move_index) {
        return Ok(cached);
    }

    // Generate coaching comment via Gemini CLI (blocking)
    let fen_clone = fen.clone();
    let played_clone = played_move.clone();
    let best_clone = best_move.clone();
    let class_clone = classification.clone();
    let color_clone = color.clone();

    let comment = tokio::task::spawn_blocking(move || {
        coach::get_coaching_comment(
            &fen_clone,
            &played_clone,
            best_clone.as_deref(),
            &class_clone,
            &color_clone,
            move_number,
        )
    })
    .await
    .map_err(|e| format!("Task error: {}", e))?
    ?;

    // Cache the result
    let _ = state.db.save_coach_comment(&game_url, move_index, &comment);

    Ok(comment)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir");

            let db = Database::new(app_dir).expect("Failed to initialize database");

            app.manage(AppState {
                db: Arc::new(db),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            fetch_profile,
            fetch_stats,
            fetch_recent_games,
            get_saved_games,
            get_game_count,
            analyze_game_cmd,
            get_openings,
            get_lessons,
            get_setting,
            set_setting,
            get_coach_comment,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

