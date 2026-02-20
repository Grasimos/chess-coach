use crate::models::*;
use shakmaty::{Chess, Position, Square, fen::Epd, san::San};

/// Analyze a PGN game and produce move-by-move analysis
pub fn analyze_game(
    pgn_text: &str,
    white: &str,
    black: &str,
    result: &str,
    time_control: &str,
    time_class: &str,
    game_url: &str,
    end_time: u64,
) -> Result<GameAnalysis, String> {
    let moves_text = extract_moves_from_pgn(pgn_text);
    let opening_name = extract_opening_from_pgn(pgn_text);
    let date_str = extract_date_from_pgn(pgn_text)
        .unwrap_or_else(|| format_timestamp(end_time));

    let mut pos = Chess::default();
    let mut move_analyses = Vec::new();
    let mut move_number = 1u32;

    let san_moves = parse_san_moves(&moves_text);

    // Book moves database (simplified ECO)
    let book_moves_count = detect_book_moves(&san_moves);

    let mut current_eval: f64 = 0.3; // Slight white opening advantage

    for (i, san_str) in san_moves.iter().enumerate() {
        let color = if i % 2 == 0 { "white" } else { "black" };
        let current_move_number = if i % 2 == 0 { move_number } else { move_number };

        let san = match San::from_ascii(san_str.as_bytes()) {
            Ok(s) => s,
            Err(_) => continue,
        };

        let m = match san.to_move(&pos) {
            Ok(m) => m,
            Err(_) => continue,
        };

        let is_book = i < book_moves_count;

        // Classify the move based on position analysis
        let classification = if is_book {
            MoveClassification::Book
        } else {
            classify_move(&pos, &m, i, san_moves.len())
        };

        // Update eval score based on classification
        let sign = if color == "white" { 1.0 } else { -1.0 };
        match classification {
            MoveClassification::Blunder => current_eval -= sign * 2.5,
            MoveClassification::Mistake => current_eval -= sign * 1.5,
            MoveClassification::Inaccuracy => current_eval -= sign * 0.6,
            MoveClassification::Brilliant => current_eval += sign * 0.4,
            MoveClassification::Great => current_eval += sign * 0.2,
            MoveClassification::Best => current_eval += sign * 0.05,
            _ => {}
        }
        current_eval = current_eval.clamp(-10.0, 10.0);

        let comment = generate_comment(&classification, san_str, color, current_move_number);

        // Extract played move squares
        let (played_from, played_to) = extract_move_squares(&m);

        // Store FEN before the move
        let fen_before = format_fen(&pos);

        // Find best alternative move for bad moves
        let (best_move_san, best_from, best_to) = if matches!(
            classification,
            MoveClassification::Inaccuracy | MoveClassification::Mistake | MoveClassification::Blunder
        ) {
            find_best_move(&pos, &m)
        } else {
            (None, None, None)
        };

        pos.play_unchecked(&m);
        let fen_after = format_fen(&pos);

        move_analyses.push(MoveAnalysis {
            move_number: current_move_number,
            san: san_str.clone(),
            color: color.to_string(),
            classification,
            comment,
            is_book_move: is_book,
            fen_after,
            played_from: Some(played_from),
            played_to: Some(played_to),
            best_move_san,
            best_from,
            best_to,
            fen_before,
            eval_score: (current_eval * 100.0).round() / 100.0,
        });

        if i % 2 == 1 {
            move_number += 1;
        }
    }

    let summary = calculate_summary(&move_analyses, &opening_name);
    let key_moments = detect_key_moments(&move_analyses);

    Ok(GameAnalysis {
        game_url: game_url.to_string(),
        white: white.to_string(),
        black: black.to_string(),
        result: result.to_string(),
        time_control: time_control.to_string(),
        time_class: time_class.to_string(),
        date: date_str,
        pgn: pgn_text.to_string(),
        moves: move_analyses,
        summary,
        key_moments,
    })
}

fn extract_moves_from_pgn(pgn: &str) -> String {
    // Find the moves section (after the last header tag)
    let mut in_header = false;
    let mut moves_start = 0;
    
    for (i, line) in pgn.lines().enumerate() {
        let trimmed = line.trim();
        if trimmed.starts_with('[') {
            in_header = true;
            continue;
        }
        if in_header && !trimmed.is_empty() && !trimmed.starts_with('[') {
            moves_start = pgn.lines().take(i).map(|l| l.len() + 1).sum::<usize>();
            break;
        }
    }

    let _ = in_header;

    if moves_start < pgn.len() {
        pgn[moves_start..].trim().to_string()
    } else {
        pgn.to_string()
    }
}

fn extract_opening_from_pgn(pgn: &str) -> Option<String> {
    for line in pgn.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("[ECOUrl ") || trimmed.starts_with("[Opening ") {
            if let Some(start) = trimmed.find('"') {
                if let Some(end) = trimmed.rfind('"') {
                    if start < end {
                        let value = &trimmed[start + 1..end];
                        // Extract opening name from ECOUrl
                        if trimmed.starts_with("[ECOUrl ") {
                            return value
                                .split('/')
                                .last()
                                .map(|s| s.replace('-', " "));
                        }
                        return Some(value.to_string());
                    }
                }
            }
        }
    }
    None
}

fn extract_date_from_pgn(pgn: &str) -> Option<String> {
    for line in pgn.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("[Date ") || trimmed.starts_with("[UTCDate ") {
            if let Some(start) = trimmed.find('"') {
                if let Some(end) = trimmed.rfind('"') {
                    if start < end {
                        return Some(trimmed[start + 1..end].to_string());
                    }
                }
            }
        }
    }
    None
}

fn format_timestamp(ts: u64) -> String {
    let dt = chrono::DateTime::from_timestamp(ts as i64, 0)
        .unwrap_or_default();
    dt.format("%Y.%m.%d").to_string()
}

fn parse_san_moves(moves_text: &str) -> Vec<String> {
    let mut moves = Vec::new();
    let cleaned = moves_text
        .replace('\n', " ")
        .replace('\r', " ");

    for token in cleaned.split_whitespace() {
        // Skip move numbers (1. 2. etc), results, and comments
        if token.ends_with('.')
            || token == "1-0"
            || token == "0-1"
            || token == "1/2-1/2"
            || token == "*"
            || token.starts_with('{')
            || token.ends_with('}')
        {
            continue;
        }
        // Skip clock annotations
        if token.starts_with("[%") || token.starts_with("%") {
            continue;
        }
        // Must look like a chess move
        if !token.is_empty()
            && (token.chars().next().unwrap().is_ascii_uppercase()
                || token.chars().next().unwrap().is_ascii_lowercase()
                || token == "O-O"
                || token == "O-O-O")
        {
            // Remove any check/checkmate symbols for cleaner parsing
            let clean = token.trim_end_matches('+').trim_end_matches('#');
            let with_annotation = if token.ends_with('#') {
                format!("{}#", clean)
            } else if token.ends_with('+') {
                format!("{}+", clean)
            } else {
                clean.to_string()
            };
            moves.push(with_annotation);
        }
    }
    moves
}

fn detect_book_moves(moves: &[String]) -> usize {
    // Common book patterns - first N moves that match known openings
    // This is a simplified detection; real engines use ECO databases
    let common_openings: Vec<Vec<&str>> = vec![
        // Italian Game
        vec!["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"],
        // Ruy Lopez
        vec!["e4", "e5", "Nf3", "Nc6", "Bb5"],
        // Sicilian Defense
        vec!["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4"],
        // French Defense
        vec!["e4", "e6", "d4", "d5"],
        // Caro-Kann
        vec!["e4", "c6", "d4", "d5"],
        // Queen's Gambit
        vec!["d4", "d5", "c4"],
        // King's Indian
        vec!["d4", "Nf6", "c4", "g6"],
        // English Opening
        vec!["c4", "e5"],
        // Scotch Game
        vec!["e4", "e5", "Nf3", "Nc6", "d4"],
        // Pirc Defense
        vec!["e4", "d6", "d4", "Nf6"],
        // London System
        vec!["d4", "d5", "Bf4"],
        // Scandinavian
        vec!["e4", "d5"],
    ];

    let move_strs: Vec<&str> = moves.iter().map(|m| {
        m.trim_end_matches('+')
            .trim_end_matches('#')
    }).collect();

    let mut best_match = 0;
    for opening in &common_openings {
        if opening.len() <= move_strs.len() {
            let matches = opening
                .iter()
                .zip(move_strs.iter())
                .take_while(|(a, b)| a == b)
                .count();
            if matches == opening.len() {
                best_match = best_match.max(matches);
            }
        }
    }

    // Add a couple more moves as "theory" after the known opening
    if best_match > 0 {
        best_match + 2
    } else {
        // At least first 2 moves are usually "book"
        2.min(moves.len())
    }
}

fn classify_move(
    pos: &Chess,
    m: &shakmaty::Move,
    move_index: usize,
    total_moves: usize,
) -> MoveClassification {
    let legal_moves = pos.legal_moves();
    
    // Only one legal move = forced
    if legal_moves.len() == 1 {
        return MoveClassification::ForcedMove;
    }

    // Heuristic-based classification
    // In a real app, you'd use a chess engine (Stockfish) for evaluation
    let is_capture = m.is_capture();
    let is_promotion = m.is_promotion();
    let is_castle = m.is_castle();

    // Check if the move results in check
    let mut test_pos = pos.clone();
    test_pos.play_unchecked(m);
    let gives_check = test_pos.is_check();
    let is_checkmate = test_pos.is_checkmate();

    if is_checkmate {
        return MoveClassification::Brilliant;
    }

    // Use randomized heuristic for demo purposes
    // In production, integrate with Stockfish UCI protocol
    let hash = simple_hash(move_index, total_moves, is_capture, gives_check);

    if is_promotion && gives_check {
        MoveClassification::Brilliant
    } else if is_castle && move_index < 20 {
        MoveClassification::Good
    } else if gives_check && is_capture {
        MoveClassification::Great
    } else {
        match hash % 100 {
            0..=3 => MoveClassification::Brilliant,
            4..=10 => MoveClassification::Great,
            11..=35 => MoveClassification::Best,
            36..=60 => MoveClassification::Good,
            61..=75 => MoveClassification::Good,
            76..=85 => MoveClassification::Inaccuracy,
            86..=93 => MoveClassification::Mistake,
            _ => MoveClassification::Blunder,
        }
    }
}

fn simple_hash(move_index: usize, total: usize, capture: bool, check: bool) -> usize {
    let mut h = move_index.wrapping_mul(2654435761);
    h ^= total.wrapping_mul(2246822519);
    if capture { h = h.wrapping_add(13); }
    if check { h = h.wrapping_add(37); }
    h % 100
}

fn generate_comment(
    classification: &MoveClassification,
    san: &str,
    color: &str,
    move_number: u32,
) -> Option<String> {
    let color_name = if color == "white" { "White" } else { "Black" };

    match classification {
        MoveClassification::Brilliant => Some(format!(
            "Brilliant move! {}. {} is an exceptional find.",
            move_number, san
        )),
        MoveClassification::Great => Some(format!(
            "Great move by {}. {} maintains strong pressure.",
            color_name, san
        )),
        MoveClassification::Best => None,
        MoveClassification::Good => None,
        MoveClassification::Book => Some("Theory move.".to_string()),
        MoveClassification::Inaccuracy => Some(format!(
            "Inaccuracy. {} could have played a more precise move here.",
            color_name
        )),
        MoveClassification::Mistake => Some(format!(
            "Mistake! {}. {} gives away part of {}'s advantage.",
            move_number, san, color_name
        )),
        MoveClassification::Blunder => Some(format!(
            "Blunder! {}. {} is a serious error that changes the evaluation significantly.",
            move_number, san
        )),
        MoveClassification::ForcedMove => Some("Only legal move.".to_string()),
    }
}

fn square_to_name(sq: Square) -> String {
    let file = (b'a' + sq.file() as u8) as char;
    let rank = (b'1' + sq.rank() as u8) as char;
    format!("{}{}", file, rank)
}

fn extract_move_squares(m: &shakmaty::Move) -> (String, String) {
    match m {
        shakmaty::Move::Normal { from, to, .. } => {
            (square_to_name(*from), square_to_name(*to))
        }
        shakmaty::Move::Castle { king, rook } => {
            // Show king movement for castling
            let king_to = if rook.file() > king.file() {
                // Kingside
                Square::from_coords(shakmaty::File::G, king.rank())
            } else {
                // Queenside
                Square::from_coords(shakmaty::File::C, king.rank())
            };
            (square_to_name(*king), square_to_name(king_to))
        }
        shakmaty::Move::EnPassant { from, to } => {
            (square_to_name(*from), square_to_name(*to))
        }
        shakmaty::Move::Put { to, .. } => {
            (square_to_name(*to), square_to_name(*to))
        }
    }
}

fn find_best_move(pos: &Chess, played_move: &shakmaty::Move) -> (Option<String>, Option<String>, Option<String>) {
    let legal_moves = pos.legal_moves();
    
    if legal_moves.len() <= 1 {
        return (None, None, None);
    }

    // Evaluate each legal move and find the best alternative
    let mut best_score = i32::MIN;
    let mut best_m: Option<&shakmaty::Move> = None;
    
    for m in &legal_moves {
        // Skip the move that was actually played
        if m == played_move {
            continue;
        }
        
        let score = evaluate_move(pos, m);
        if score > best_score {
            best_score = score;
            best_m = Some(m);
        }
    }

    if let Some(m) = best_m {
        let (from, to) = extract_move_squares(m);
        let san = San::from_move(pos, m);
        (Some(san.to_string()), Some(from), Some(to))
    } else {
        (None, None, None)
    }
}

fn evaluate_move(pos: &Chess, m: &shakmaty::Move) -> i32 {
    let mut score = 0i32;
    
    // Play the move on a test position
    let mut test_pos = pos.clone();
    test_pos.play_unchecked(m);
    
    // Checkmate is the best possible move
    if test_pos.is_checkmate() {
        return 10000;
    }
    
    // Check gives bonus
    if test_pos.is_check() {
        score += 50;
    }
    
    // Captures are generally good - value of captured piece
    if m.is_capture() {
        score += match m {
            shakmaty::Move::Normal { to, .. } | shakmaty::Move::EnPassant { to, .. } => {
                // Estimate captured piece value from the board
                if let Some(piece) = pos.board().piece_at(*to) {
                    match piece.role {
                        shakmaty::Role::Pawn => 100,
                        shakmaty::Role::Knight => 320,
                        shakmaty::Role::Bishop => 330,
                        shakmaty::Role::Rook => 500,
                        shakmaty::Role::Queen => 900,
                        shakmaty::Role::King => 0,
                    }
                } else if matches!(m, shakmaty::Move::EnPassant { .. }) {
                    100 // En passant captures a pawn
                } else {
                    0
                }
            }
            _ => 0,
        };
    }
    
    // Promotion is great
    if m.is_promotion() {
        score += 800;
    }
    
    // Castling is generally good in the opening
    if m.is_castle() {
        score += 60;
    }
    
    // Center control bonus - moving pieces to center
    match m {
        shakmaty::Move::Normal { to, .. } => {
            let file = to.file() as i32;
            let rank = to.rank() as i32;
            // Bonus for central squares
            let center_bonus = 4 - ((file - 3).abs() + (rank - 3).abs());
            score += center_bonus.max(0) * 5;
        }
        _ => {}
    }
    
    // Penalty if the move leaves pieces hanging (opponent can recapture)
    let opponent_moves = test_pos.legal_moves();
    let responding_captures = opponent_moves.iter().filter(|om| om.is_capture()).count();
    if responding_captures > 0 && !m.is_capture() {
        score -= 20;
    }
    
    score
}

fn format_fen(pos: &Chess) -> String {
    let epd = Epd::from_position(pos.clone(), shakmaty::EnPassantMode::Legal);
    epd.to_string()
}

fn calculate_summary(moves: &[MoveAnalysis], opening: &Option<String>) -> GameSummary {
    let mut brilliancies = 0u32;
    let mut great_moves = 0u32;
    let mut best_moves = 0u32;
    let mut good_moves = 0u32;
    let mut inaccuracies = 0u32;
    let mut mistakes = 0u32;
    let mut blunders = 0u32;

    for m in moves {
        match m.classification {
            MoveClassification::Brilliant => brilliancies += 1,
            MoveClassification::Great => great_moves += 1,
            MoveClassification::Best => best_moves += 1,
            MoveClassification::Good => good_moves += 1,
            MoveClassification::Inaccuracy => inaccuracies += 1,
            MoveClassification::Mistake => mistakes += 1,
            MoveClassification::Blunder => blunders += 1,
            _ => {}
        }
    }

    let total = moves.len() as f64;
    let good_total = (brilliancies + great_moves + best_moves + good_moves) as f64;
    let accuracy = if total > 0.0 {
        (good_total / total * 100.0).min(100.0)
    } else {
        0.0
    };

    GameSummary {
        total_moves: moves.len() as u32,
        brilliancies,
        great_moves,
        best_moves,
        good_moves,
        inaccuracies,
        mistakes,
        blunders,
        accuracy: (accuracy * 10.0).round() / 10.0,
        opening_name: opening.clone(),
    }
}

fn detect_key_moments(moves: &[MoveAnalysis]) -> Vec<KeyMoment> {
    let mut moments = Vec::new();

    for (i, m) in moves.iter().enumerate() {
        let (severity, description) = match m.classification {
            MoveClassification::Blunder => {
                let desc = format!(
                    "{}. {} — a blunder that significantly changed the game.",
                    m.move_number, m.san
                );
                ("critical".to_string(), desc)
            }
            MoveClassification::Mistake => {
                let desc = format!(
                    "{}. {} — a mistake that gave away advantage.",
                    m.move_number, m.san
                );
                ("major".to_string(), desc)
            }
            MoveClassification::Brilliant => {
                let desc = format!(
                    "{}. {} — a brilliant find!",
                    m.move_number, m.san
                );
                ("notable".to_string(), desc)
            }
            MoveClassification::Inaccuracy => {
                // Only mark inaccuracies as key moments if followed by another bad move
                if i + 1 < moves.len() {
                    match moves[i + 1].classification {
                        MoveClassification::Mistake | MoveClassification::Blunder | MoveClassification::Inaccuracy => {
                            let desc = format!(
                                "{}. {} — inaccuracy leading to further trouble.",
                                m.move_number, m.san
                            );
                            ("notable".to_string(), desc)
                        }
                        _ => continue,
                    }
                } else {
                    continue;
                }
            }
            _ => continue,
        };

        moments.push(KeyMoment {
            move_index: i,
            move_number: m.move_number,
            san: m.san.clone(),
            color: m.color.clone(),
            classification: format!("{:?}", m.classification),
            description,
            severity,
        });
    }

    // Sort by severity (critical first) and keep top 5
    moments.sort_by(|a, b| {
        let severity_order = |s: &str| match s {
            "critical" => 0,
            "major" => 1,
            "notable" => 2,
            _ => 3,
        };
        severity_order(&a.severity)
            .cmp(&severity_order(&b.severity))
            .then(a.move_index.cmp(&b.move_index))
    });
    moments.truncate(7);
    // Re-sort by move index for chronological display
    moments.sort_by_key(|m| m.move_index);
    moments
}
