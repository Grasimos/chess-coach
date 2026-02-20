use crate::models::*;
use reqwest::Client;

const CHESS_COM_API: &str = "https://api.chess.com/pub";

pub struct ChessComClient {
    client: Client,
}

impl ChessComClient {
    pub fn new() -> Self {
        let client = Client::builder()
            .user_agent("ChessCoach/1.0")
            .build()
            .expect("Failed to build HTTP client");
        Self { client }
    }

    pub async fn get_profile(&self, username: &str) -> Result<ChessComProfile, String> {
        let url = format!("{}/player/{}", CHESS_COM_API, username.to_lowercase());
        self.client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch profile: {}", e))?
            .json::<ChessComProfile>()
            .await
            .map_err(|e| format!("Failed to parse profile: {}", e))
    }

    pub async fn get_stats(&self, username: &str) -> Result<ChessComStats, String> {
        let url = format!("{}/player/{}/stats", CHESS_COM_API, username.to_lowercase());
        self.client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch stats: {}", e))?
            .json::<ChessComStats>()
            .await
            .map_err(|e| format!("Failed to parse stats: {}", e))
    }

    pub async fn get_archives(&self, username: &str) -> Result<Vec<String>, String> {
        let url = format!(
            "{}/player/{}/games/archives",
            CHESS_COM_API,
            username.to_lowercase()
        );
        let response: ChessComArchivesResponse = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch archives: {}", e))?
            .json()
            .await
            .map_err(|e| format!("Failed to parse archives: {}", e))?;
        Ok(response.archives)
    }

    pub async fn get_games_from_archive(
        &self,
        archive_url: &str,
    ) -> Result<Vec<ChessComGame>, String> {
        let response: ChessComGamesResponse = self
            .client
            .get(archive_url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch games: {}", e))?
            .json()
            .await
            .map_err(|e| format!("Failed to parse games: {}", e))?;
        Ok(response.games)
    }

    pub async fn get_recent_games(
        &self,
        username: &str,
        limit: usize,
    ) -> Result<Vec<ChessComGame>, String> {
        let archives = self.get_archives(username).await?;
        let mut all_games = Vec::new();

        // Get games from most recent archives first
        for archive_url in archives.iter().rev() {
            let games = self.get_games_from_archive(archive_url).await?;
            all_games.extend(games);
            if all_games.len() >= limit {
                break;
            }
        }

        // Sort by end_time descending and take the limit
        all_games.sort_by(|a, b| b.end_time.unwrap_or(0).cmp(&a.end_time.unwrap_or(0)));
        all_games.truncate(limit);

        Ok(all_games)
    }
}
