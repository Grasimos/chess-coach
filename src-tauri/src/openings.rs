use crate::models::*;

pub fn get_all_openings() -> Vec<Opening> {
    vec![
        // === KING'S PAWN OPENINGS (e4) ===
        Opening {
            eco: "C50".to_string(),
            name: "Italian Game".to_string(),
            pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4".to_string(),
            moves: vec!["e4".into(), "e5".into(), "Nf3".into(), "Nc6".into(), "Bc4".into()],
            category: OpeningCategory::KingPawn,
            description: "One of the oldest and most classical openings. White develops the bishop to c4, targeting the f7 pawn and fighting for the center.".to_string(),
            key_ideas: vec![
                "Control the center with e4 and d4".into(),
                "Develop pieces quickly to active squares".into(),
                "Target the weak f7 pawn".into(),
                "Prepare for kingside castling".into(),
            ],
        },
        Opening {
            eco: "C60".to_string(),
            name: "Ruy Lopez (Spanish Game)".to_string(),
            pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5".to_string(),
            moves: vec!["e4".into(), "e5".into(), "Nf3".into(), "Nc6".into(), "Bb5".into()],
            category: OpeningCategory::KingPawn,
            description: "The Ruy Lopez is one of the most popular and deeply analyzed openings. White pins the knight that defends e5, creating long-term pressure.".to_string(),
            key_ideas: vec![
                "Put pressure on e5 through the pin on Nc6".into(),
                "Build a strong pawn center with d4".into(),
                "Control the game for the long term".into(),
                "The Marshall Attack is a famous counter-gambit".into(),
            ],
        },
        Opening {
            eco: "C44".to_string(),
            name: "Scotch Game".to_string(),
            pgn: "1. e4 e5 2. Nf3 Nc6 3. d4".to_string(),
            moves: vec!["e4".into(), "e5".into(), "Nf3".into(), "Nc6".into(), "d4".into()],
            category: OpeningCategory::KingPawn,
            description: "White immediately strikes in the center with d4, leading to open positions with active piece play.".to_string(),
            key_ideas: vec![
                "Open the center immediately".into(),
                "Gain space and initiative".into(),
                "Lead to tactical, open positions".into(),
                "Kasparov popularized it at the highest level".into(),
            ],
        },
        Opening {
            eco: "C25".to_string(),
            name: "Vienna Game".to_string(),
            pgn: "1. e4 e5 2. Nc3".to_string(),
            moves: vec!["e4".into(), "e5".into(), "Nc3".into()],
            category: OpeningCategory::KingPawn,
            description: "A flexible opening where White develops the knight to c3, keeping options for f4 (Vienna Gambit) or Bc4.".to_string(),
            key_ideas: vec![
                "Prepare f4 for aggressive play".into(),
                "Flexible development".into(),
                "Can transpose into many lines".into(),
                "Good surprise weapon".into(),
            ],
        },
        Opening {
            eco: "C30".to_string(),
            name: "King's Gambit".to_string(),
            pgn: "1. e4 e5 2. f4".to_string(),
            moves: vec!["e4".into(), "e5".into(), "f4".into()],
            category: OpeningCategory::KingPawn,
            description: "One of the most romantic and aggressive openings. White sacrifices the f-pawn to gain rapid development and open the f-file.".to_string(),
            key_ideas: vec![
                "Sacrifice a pawn for rapid development".into(),
                "Open the f-file for the rook".into(),
                "Attack the black king aggressively".into(),
                "Lead to sharp, tactical positions".into(),
            ],
        },

        // === SICILIAN DEFENSE ===
        Opening {
            eco: "B20".to_string(),
            name: "Sicilian Defense".to_string(),
            pgn: "1. e4 c5".to_string(),
            moves: vec!["e4".into(), "c5".into()],
            category: OpeningCategory::SemiOpen,
            description: "The most popular defense against 1.e4. Black fights for the center asymmetrically and aims for counterplay on the queenside.".to_string(),
            key_ideas: vec![
                "Create an asymmetric pawn structure".into(),
                "Counter-attack on the queenside".into(),
                "Rich tactical and strategic possibilities".into(),
                "Semi-open c-file for Black's counterplay".into(),
            ],
        },
        Opening {
            eco: "B33".to_string(),
            name: "Sicilian Najdorf".to_string(),
            pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6".to_string(),
            moves: vec!["e4".into(), "c5".into(), "Nf3".into(), "d6".into(), "d4".into(), "cxd4".into(), "Nxd4".into(), "Nf6".into(), "Nc3".into(), "a6".into()],
            category: OpeningCategory::SemiOpen,
            description: "The sharpest and most popular Sicilian variation. Bobby Fischer and Garry Kasparov were famous practitioners.".to_string(),
            key_ideas: vec![
                "Flexible pawn structure for Black".into(),
                "Prepare ...e5 or ...b5 expansion".into(),
                "Extremely rich tactical play".into(),
                "One of the most theoretically complex openings".into(),
            ],
        },
        Opening {
            eco: "B90".to_string(),
            name: "Sicilian Dragon".to_string(),
            pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6".to_string(),
            moves: vec!["e4".into(), "c5".into(), "Nf3".into(), "d6".into(), "d4".into(), "cxd4".into(), "Nxd4".into(), "Nf6".into(), "Nc3".into(), "g6".into()],
            category: OpeningCategory::SemiOpen,
            description: "Black fianchettoes the bishop on g7, creating a 'dragon' formation. Known for the vicious Yugoslav Attack.".to_string(),
            key_ideas: vec![
                "Fianchetto the dark-squared bishop".into(),
                "Counterplay along the c-file".into(),
                "Yugoslav Attack leads to opposite-side castling battles".into(),
                "Dynamic and aggressive for both sides".into(),
            ],
        },

        // === FRENCH DEFENSE ===
        Opening {
            eco: "C00".to_string(),
            name: "French Defense".to_string(),
            pgn: "1. e4 e6".to_string(),
            moves: vec!["e4".into(), "e6".into()],
            category: OpeningCategory::SemiOpen,
            description: "A solid defense where Black prepares ...d5 to challenge White's center. Leads to strategic, complex positions.".to_string(),
            key_ideas: vec![
                "Challenge the center with ...d5".into(),
                "Solid pawn structure".into(),
                "Counterplay on the queenside".into(),
                "The light-squared bishop is often a strategic challenge".into(),
            ],
        },

        // === CARO-KANN ===
        Opening {
            eco: "B10".to_string(),
            name: "Caro-Kann Defense".to_string(),
            pgn: "1. e4 c6".to_string(),
            moves: vec!["e4".into(), "c6".into()],
            category: OpeningCategory::SemiOpen,
            description: "A solid, positional defense preparing ...d5. Unlike the French, it doesn't block the light-squared bishop.".to_string(),
            key_ideas: vec![
                "Solid center with ...d5".into(),
                "Light-squared bishop remains active".into(),
                "Less tactical than the Sicilian".into(),
                "Good for players who prefer solid, strategic play".into(),
            ],
        },

        // === PIRC DEFENSE ===
        Opening {
            eco: "B07".to_string(),
            name: "Pirc Defense".to_string(),
            pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6".to_string(),
            moves: vec!["e4".into(), "d6".into(), "d4".into(), "Nf6".into(), "Nc3".into(), "g6".into()],
            category: OpeningCategory::SemiOpen,
            description: "A hypermodern defense where Black allows White to build a center, then attacks it with pieces.".to_string(),
            key_ideas: vec![
                "Hypermodern approach to the center".into(),
                "Fianchetto the king's bishop".into(),
                "Counter-attack the center later".into(),
                "Flexible and less theory-heavy".into(),
            ],
        },

        // === SCANDINAVIAN ===
        Opening {
            eco: "B01".to_string(),
            name: "Scandinavian Defense".to_string(),
            pgn: "1. e4 d5".to_string(),
            moves: vec!["e4".into(), "d5".into()],
            category: OpeningCategory::SemiOpen,
            description: "Black immediately challenges e4 with ...d5. After 2. exd5 Qxd5, the queen comes out early but Black has a solid setup.".to_string(),
            key_ideas: vec![
                "Immediate central confrontation".into(),
                "Simple development scheme".into(),
                "Queen comes out early to d5".into(),
                "Solid and practical choice".into(),
            ],
        },

        // === QUEEN'S PAWN OPENINGS ===
        Opening {
            eco: "D30".to_string(),
            name: "Queen's Gambit".to_string(),
            pgn: "1. d4 d5 2. c4".to_string(),
            moves: vec!["d4".into(), "d5".into(), "c4".into()],
            category: OpeningCategory::QueenPawn,
            description: "One of the oldest and most respected openings. White offers the c-pawn to gain central control.".to_string(),
            key_ideas: vec![
                "Fight for central control".into(),
                "The pawn sacrifice is temporary".into(),
                "Two main responses: Accepted and Declined".into(),
                "Leads to rich strategic play".into(),
            ],
        },
        Opening {
            eco: "D35".to_string(),
            name: "Queen's Gambit Declined".to_string(),
            pgn: "1. d4 d5 2. c4 e6".to_string(),
            moves: vec!["d4".into(), "d5".into(), "c4".into(), "e6".into()],
            category: OpeningCategory::QueenPawn,
            description: "Black declines the gambit and supports the d5 pawn. One of the most classical and solid openings.".to_string(),
            key_ideas: vec![
                "Maintain a solid pawn center".into(),
                "Classical piece development".into(),
                "The minority attack on the queenside".into(),
                "Strategically deep positions".into(),
            ],
        },
        Opening {
            eco: "E60".to_string(),
            name: "King's Indian Defense".to_string(),
            pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7".to_string(),
            moves: vec!["d4".into(), "Nf6".into(), "c4".into(), "g6".into(), "Nc3".into(), "Bg7".into()],
            category: OpeningCategory::Indian,
            description: "A dynamic defense where Black allows White to build a large center, then counter-attacks it. Bobby Fischer's favorite.".to_string(),
            key_ideas: vec![
                "Allow White to build a center, then attack it".into(),
                "Kingside attack with ...f5 and ...g5".into(),
                "The fianchettoed bishop is very powerful".into(),
                "Dynamic and aggressive counterplay".into(),
            ],
        },
        Opening {
            eco: "E00".to_string(),
            name: "Nimzo-Indian Defense".to_string(),
            pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4".to_string(),
            moves: vec!["d4".into(), "Nf6".into(), "c4".into(), "e6".into(), "Nc3".into(), "Bb4".into()],
            category: OpeningCategory::Indian,
            description: "One of the most respected defenses. Black pins the knight on c3, fighting for control of e4.".to_string(),
            key_ideas: vec![
                "Pin the knight to control e4".into(),
                "Excellent piece activity".into(),
                "Flexible pawn structure".into(),
                "Considered one of the best replies to 1.d4".into(),
            ],
        },
        Opening {
            eco: "D70".to_string(),
            name: "Grünfeld Defense".to_string(),
            pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5".to_string(),
            moves: vec!["d4".into(), "Nf6".into(), "c4".into(), "g6".into(), "Nc3".into(), "d5".into()],
            category: OpeningCategory::Indian,
            description: "A hypermodern defense where Black strikes at the center with ...d5 after fianchettoing. Very dynamic and theoretical.".to_string(),
            key_ideas: vec![
                "Strike at the center with ...d5".into(),
                "Pressure on d4 with the fianchettoed bishop".into(),
                "Very dynamic pawn play".into(),
                "Kasparov used it extensively".into(),
            ],
        },
        Opening {
            eco: "A45".to_string(),
            name: "London System".to_string(),
            pgn: "1. d4 d5 2. Bf4".to_string(),
            moves: vec!["d4".into(), "d5".into(), "Bf4".into()],
            category: OpeningCategory::QueenPawn,
            description: "A solid, system-based opening where White develops the bishop to f4 early. Popular at all levels for its simplicity and reliability.".to_string(),
            key_ideas: vec![
                "Solid development scheme".into(),
                "Bishop on f4 controls key squares".into(),
                "Easy to learn and play".into(),
                "Avoid heavy theory".into(),
            ],
        },

        // === FLANK OPENINGS ===
        Opening {
            eco: "A10".to_string(),
            name: "English Opening".to_string(),
            pgn: "1. c4".to_string(),
            moves: vec!["c4".into()],
            category: OpeningCategory::Flank,
            description: "A flexible flank opening that can transpose into many systems. White fights for the center from the side.".to_string(),
            key_ideas: vec![
                "Control d5 from the flank".into(),
                "Very flexible - can transpose to many systems".into(),
                "Often leads to positional play".into(),
                "Popular with top-level players".into(),
            ],
        },
        Opening {
            eco: "A04".to_string(),
            name: "Réti Opening".to_string(),
            pgn: "1. Nf3 d5 2. c4".to_string(),
            moves: vec!["Nf3".into(), "d5".into(), "c4".into()],
            category: OpeningCategory::Flank,
            description: "A hypermodern opening where White develops knights before pawns and aims to control the center from afar.".to_string(),
            key_ideas: vec![
                "Hypermodern center control".into(),
                "Flexible pawn structure".into(),
                "Can transpose to Queen's Gambit lines".into(),
                "Richard Réti's revolutionary approach".into(),
            ],
        },
        Opening {
            eco: "A00".to_string(),
            name: "Bird's Opening".to_string(),
            pgn: "1. f4".to_string(),
            moves: vec!["f4".into()],
            category: OpeningCategory::Flank,
            description: "An aggressive flank opening controlling the e5 square. Leads to creative, unbalanced positions.".to_string(),
            key_ideas: vec![
                "Control e5 with the f-pawn".into(),
                "Often follows with fianchetto of king's bishop".into(),
                "Creative and less theoretical".into(),
                "Can lead to reversed Dutch positions".into(),
            ],
        },
    ]
}

pub fn get_openings_by_category(category: &str) -> Vec<Opening> {
    let all = get_all_openings();
    match category {
        "king_pawn" => all.into_iter().filter(|o| matches!(o.category, OpeningCategory::KingPawn)).collect(),
        "queen_pawn" => all.into_iter().filter(|o| matches!(o.category, OpeningCategory::QueenPawn)).collect(),
        "flank" => all.into_iter().filter(|o| matches!(o.category, OpeningCategory::Flank)).collect(),
        "indian" => all.into_iter().filter(|o| matches!(o.category, OpeningCategory::Indian)).collect(),
        "semi_open" => all.into_iter().filter(|o| matches!(o.category, OpeningCategory::SemiOpen)).collect(),
        _ => all,
    }
}
