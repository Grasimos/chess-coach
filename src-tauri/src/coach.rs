use std::process::Command;

/// Build a structured chess coaching prompt
fn build_coach_prompt(
    fen: &str,
    played_move: &str,
    best_move: Option<&str>,
    classification: &str,
    color: &str,
    move_number: u32,
) -> String {
    let context = match classification {
        "Blunder" => "This was a BLUNDER — a serious mistake that significantly worsens the position.",
        "Mistake" => "This was a MISTAKE — it gives away a meaningful advantage.",
        "Inaccuracy" => "This was an INACCURACY — a slightly imprecise move that misses a better option.",
        "Brilliant" => "This was a BRILLIANT move — an exceptional and hard-to-find move!",
        "Great" => "This was a GREAT move — strong and well-calculated.",
        _ => "Analyze this chess move.",
    };

    let best_info = match best_move {
        Some(bm) => format!("The best move was: {}\n", bm),
        None => String::new(),
    };

    format!(
        r#"You are a friendly chess coach helping a player improve. Analyze this specific moment:

Position (FEN): {}
Move played: {}. {} ({})
{}Classification: {}

{}

Give a short, educational explanation (2-3 sentences max) in a warm coaching tone. Focus on:
- WHY the played move is {} (what does it miss or achieve?)
- WHAT the better alternative does (if applicable)
- A practical TIP the player can remember

Keep it concise, specific to this position, and avoid generic advice. Do NOT include the FEN or move notation in your response — the player already sees those. Do NOT use markdown formatting."#,
        fen,
        move_number,
        played_move,
        color,
        best_info,
        classification,
        context,
        classification.to_lowercase(),
    )
}

/// Call Gemini CLI to get coaching comment
/// Uses `echo "prompt" | gemini 2>/dev/null` which works with Google Pro subscription (free)
pub fn get_coaching_comment(
    fen: &str,
    played_move: &str,
    best_move: Option<&str>,
    classification: &str,
    color: &str,
    move_number: u32,
) -> Result<String, String> {
    let prompt = build_coach_prompt(fen, played_move, best_move, classification, color, move_number);

    // Run: echo "prompt" | gemini 2>/dev/null
    // The gemini CLI reads from stdin when piped and outputs to stdout
    let output = Command::new("sh")
        .arg("-c")
        .arg(format!(
            r#"echo {} | gemini 2>/dev/null"#,
            shell_escape(&prompt)
        ))
        .output()
        .map_err(|e| format!("Failed to run gemini CLI: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Gemini CLI error: {}", stderr.trim()));
    }

    let response = String::from_utf8_lossy(&output.stdout).trim().to_string();

    if response.is_empty() {
        return Err("Gemini CLI returned empty response".to_string());
    }

    Ok(response)
}

/// Escape a string for safe use in shell single-quotes
fn shell_escape(s: &str) -> String {
    // Use single quotes, escaping any existing single quotes
    format!("'{}'", s.replace('\'', "'\\''"))
}
