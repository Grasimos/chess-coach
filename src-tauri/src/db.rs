use crate::models::ChessComGame;
use rusqlite::{Connection, params};
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new(app_dir: PathBuf) -> Result<Self, String> {
        std::fs::create_dir_all(&app_dir)
            .map_err(|e| format!("Failed to create app dir: {}", e))?;

        let db_path = app_dir.join("chess_coach.db");
        let conn = Connection::open(&db_path)
            .map_err(|e| format!("Failed to open database: {}", e))?;

        // Create tables
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL UNIQUE,
                pgn TEXT,
                time_control TEXT,
                end_time INTEGER,
                rated INTEGER,
                time_class TEXT,
                rules TEXT,
                white_username TEXT NOT NULL,
                white_rating INTEGER,
                white_result TEXT NOT NULL,
                black_username TEXT NOT NULL,
                black_rating INTEGER,
                black_result TEXT NOT NULL,
                username TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS analysis_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_url TEXT NOT NULL UNIQUE,
                analysis_json TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS coach_comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_url TEXT NOT NULL,
                move_index INTEGER NOT NULL,
                comment TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(game_url, move_index)
            );

            CREATE INDEX IF NOT EXISTS idx_games_username ON games(username);
            CREATE INDEX IF NOT EXISTS idx_games_end_time ON games(end_time);
            CREATE INDEX IF NOT EXISTS idx_games_url ON games(url);
            CREATE INDEX IF NOT EXISTS idx_coach_game ON coach_comments(game_url);",
        )
        .map_err(|e| format!("Failed to create tables: {}", e))?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn save_games(&self, username: &str, games: &[ChessComGame]) -> Result<usize, String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;
        let mut saved = 0;

        for game in games {
            let result = conn.execute(
                "INSERT OR IGNORE INTO games (url, pgn, time_control, end_time, rated, time_class, rules, white_username, white_rating, white_result, black_username, black_rating, black_result, username)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
                params![
                    game.url,
                    game.pgn,
                    game.time_control,
                    game.end_time,
                    game.rated.map(|r| r as i32),
                    game.time_class,
                    game.rules,
                    game.white.username,
                    game.white.rating,
                    game.white.result,
                    game.black.username,
                    game.black.rating,
                    game.black.result,
                    username.to_lowercase(),
                ],
            );

            match result {
                Ok(n) if n > 0 => saved += 1,
                Ok(_) => {} // Already existed
                Err(e) => eprintln!("Failed to save game: {}", e),
            }
        }

        Ok(saved)
    }

    pub fn get_saved_games(&self, username: &str, limit: usize) -> Result<Vec<ChessComGame>, String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;

        let mut stmt = conn
            .prepare(
                "SELECT url, pgn, time_control, end_time, rated, time_class, rules, white_username, white_rating, white_result, black_username, black_rating, black_result
                 FROM games WHERE username = ?1 ORDER BY end_time DESC LIMIT ?2",
            )
            .map_err(|e| format!("Query error: {}", e))?;

        let games = stmt
            .query_map(params![username.to_lowercase(), limit as i64], |row| {
                use crate::models::ChessComPlayer;

                Ok(ChessComGame {
                    url: row.get(0)?,
                    pgn: row.get(1)?,
                    time_control: row.get(2)?,
                    end_time: row.get::<_, Option<i64>>(3)?.map(|v| v as u64),
                    rated: row.get::<_, Option<i32>>(4)?.map(|v| v != 0),
                    time_class: row.get(5)?,
                    rules: row.get(6)?,
                    white: ChessComPlayer {
                        username: row.get(7)?,
                        rating: row.get::<_, Option<i32>>(8)?.map(|v| v as u32),
                        result: row.get(9)?,
                        id: None,
                    },
                    black: ChessComPlayer {
                        username: row.get(10)?,
                        rating: row.get::<_, Option<i32>>(11)?.map(|v| v as u32),
                        result: row.get(12)?,
                        id: None,
                    },
                })
            })
            .map_err(|e| format!("Query map error: {}", e))?
            .filter_map(|r| r.ok())
            .collect();

        Ok(games)
    }

    pub fn get_latest_end_time(&self, username: &str) -> Result<Option<u64>, String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;

        let result: Option<i64> = conn
            .query_row(
                "SELECT MAX(end_time) FROM games WHERE username = ?1",
                params![username.to_lowercase()],
                |row| row.get(0),
            )
            .map_err(|e| format!("Query error: {}", e))?;

        Ok(result.map(|v| v as u64))
    }

    pub fn get_game_count(&self, username: &str) -> Result<usize, String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;

        let count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM games WHERE username = ?1",
                params![username.to_lowercase()],
                |row| row.get(0),
            )
            .map_err(|e| format!("Query error: {}", e))?;

        Ok(count as usize)
    }

    pub fn save_analysis(&self, game_url: &str, analysis_json: &str) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;

        conn.execute(
            "INSERT OR REPLACE INTO analysis_cache (game_url, analysis_json) VALUES (?1, ?2)",
            params![game_url, analysis_json],
        )
        .map_err(|e| format!("Failed to save analysis: {}", e))?;

        Ok(())
    }

    pub fn get_analysis(&self, game_url: &str) -> Result<Option<String>, String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;

        let result = conn.query_row(
            "SELECT analysis_json FROM analysis_cache WHERE game_url = ?1",
            params![game_url],
            |row| row.get::<_, String>(0),
        );

        match result {
            Ok(json) => Ok(Some(json)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(format!("Query error: {}", e)),
        }
    }

    pub fn get_setting(&self, key: &str) -> Result<Option<String>, String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;
        let result = conn.query_row(
            "SELECT value FROM settings WHERE key = ?1",
            params![key],
            |row| row.get::<_, String>(0),
        );
        match result {
            Ok(val) => Ok(Some(val)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(format!("Query error: {}", e)),
        }
    }

    pub fn set_setting(&self, key: &str, value: &str) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
            params![key, value],
        )
        .map_err(|e| format!("Failed to save setting: {}", e))?;
        Ok(())
    }

    pub fn save_coach_comment(&self, game_url: &str, move_index: usize, comment: &str) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;
        conn.execute(
            "INSERT OR REPLACE INTO coach_comments (game_url, move_index, comment) VALUES (?1, ?2, ?3)",
            params![game_url, move_index as i64, comment],
        )
        .map_err(|e| format!("Failed to save coach comment: {}", e))?;
        Ok(())
    }

    pub fn get_coach_comment(&self, game_url: &str, move_index: usize) -> Result<Option<String>, String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;
        let result = conn.query_row(
            "SELECT comment FROM coach_comments WHERE game_url = ?1 AND move_index = ?2",
            params![game_url, move_index as i64],
            |row| row.get::<_, String>(0),
        );
        match result {
            Ok(comment) => Ok(Some(comment)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(format!("Query error: {}", e)),
        }
    }
}
