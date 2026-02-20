use crate::models::*;

pub fn get_all_lessons() -> Vec<Lesson> {
    vec![
        // === MIDDLEGAME LESSONS ===
        Lesson {
            id: "mid-01".to_string(),
            title: "Piece Activity & Coordination".to_string(),
            category: LessonCategory::Middlegame,
            difficulty: Difficulty::Beginner,
            description: "Learn how to keep your pieces active and working together as a team.".to_string(),
            content: vec![
                LessonSection {
                    title: "The Importance of Active Pieces".to_string(),
                    content: "In chess, the value of a piece depends largely on its activity. A bishop locked behind its own pawns is worth less than a knight on a strong outpost. Always ask yourself: 'Are all my pieces doing something useful?'".to_string(),
                    fen: Some("r1bqkb1r/pppppppp/2n2n2/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3".to_string()),
                    moves: None,
                },
                LessonSection {
                    title: "Piece Coordination".to_string(),
                    content: "Pieces are most powerful when they work together. Knights and bishops complement each other well - the knight covers squares the bishop cannot reach. Rooks are strongest on open files, especially when doubled.".to_string(),
                    fen: Some("r2qk2r/ppp2ppp/2np1n2/2b1p1B1/2B1P1b1/2NP1N2/PPP2PPP/R2QK2R w KQkq - 4 7".to_string()),
                    moves: None,
                },
                LessonSection {
                    title: "Improving Your Worst Piece".to_string(),
                    content: "A key middlegame strategy is to identify your least active piece and find a way to improve it. This simple concept can dramatically improve your play.".to_string(),
                    fen: None,
                    moves: None,
                },
            ],
            completed: false,
        },
        Lesson {
            id: "mid-02".to_string(),
            title: "Pawn Structure Fundamentals".to_string(),
            category: LessonCategory::Middlegame,
            difficulty: Difficulty::Beginner,
            description: "Understanding pawn structures and how they dictate your plans.".to_string(),
            content: vec![
                LessonSection {
                    title: "Types of Pawn Structures".to_string(),
                    content: "Pawn structures form the backbone of your position. Key types include: isolated pawns, doubled pawns, backward pawns, pawn chains, and passed pawns. Each has its own set of plans and weaknesses.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "Weak Pawns and Outposts".to_string(),
                    content: "Weak pawns (isolated, backward, or doubled) create holes in the position. These holes can become outposts for your pieces, especially knights. Control of outposts is a key strategic concept.".to_string(),
                    fen: Some("rnbqkb1r/pp3ppp/4pn2/3p4/3P4/4PN2/PP3PPP/RNBQKB1R w KQkq - 0 5".to_string()),
                    moves: None,
                },
                LessonSection {
                    title: "Pawn Breaks".to_string(),
                    content: "Pawn breaks are pawn moves that challenge the opponent's pawn structure. They often open lines for your pieces. Common examples: c5 break against the d4 pawn, f5 break to attack the kingside.".to_string(),
                    fen: None,
                    moves: None,
                },
            ],
            completed: false,
        },
        Lesson {
            id: "mid-03".to_string(),
            title: "Attacking the King".to_string(),
            category: LessonCategory::Middlegame,
            difficulty: Difficulty::Intermediate,
            description: "Learn the principles of launching a successful kingside attack.".to_string(),
            content: vec![
                LessonSection {
                    title: "Prerequisites for a King Attack".to_string(),
                    content: "Before launching an attack, you typically need: a lead in development, control of the center, and pieces aimed at the king. Don't attack prematurely without these conditions!".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "Common Attacking Patterns".to_string(),
                    content: "Learn to recognize patterns: the Greek Gift sacrifice (Bxh7+), the double bishop sacrifice, the rook lift (Ra3-h3), and pawn storms (g4-g5-g6). These patterns appear repeatedly in master games.".to_string(),
                    fen: Some("r1bq1rk1/pppnnppp/4p3/3pP3/1b1P4/2NB1N2/PPP2PPP/R1BQK2R w KQ - 5 8".to_string()),
                    moves: Some(vec!["Bxh7+".into(), "Kxh7".into(), "Ng5+".into()]),
                },
                LessonSection {
                    title: "Opposite-Side Castling Attacks".to_string(),
                    content: "When both sides castle on opposite sides, a pawn storm race begins. Advance your pawns on the side where the opponent's king is castled. Speed is crucial in these situations.".to_string(),
                    fen: None,
                    moves: None,
                },
            ],
            completed: false,
        },
        Lesson {
            id: "mid-04".to_string(),
            title: "Tactical Patterns & Combinations".to_string(),
            category: LessonCategory::Tactics,
            difficulty: Difficulty::Intermediate,
            description: "Master the most common tactical patterns: forks, pins, skewers, and more.".to_string(),
            content: vec![
                LessonSection {
                    title: "Forks (Double Attacks)".to_string(),
                    content: "A fork is when one piece attacks two or more enemy pieces simultaneously. Knights are especially effective at forking because they attack in a unique pattern that other pieces cannot block.".to_string(),
                    fen: Some("r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4".to_string()),
                    moves: None,
                },
                LessonSection {
                    title: "Pins and Skewers".to_string(),
                    content: "A pin restricts a piece from moving because it would expose a more valuable piece behind it. A skewer is the reverse: the more valuable piece is forced to move, exposing a piece behind it.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "Discovered Attacks".to_string(),
                    content: "A discovered attack occurs when a piece moves, revealing an attack from another piece behind it. Discovered checks are especially dangerous because the moving piece can attack freely.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "Deflection and Decoy".to_string(),
                    content: "Deflection forces a defending piece away from a critical square. Decoy lures a piece to a bad square. Both tactics exploit overloaded defenders.".to_string(),
                    fen: None,
                    moves: None,
                },
            ],
            completed: false,
        },
        Lesson {
            id: "mid-05".to_string(),
            title: "Strategic Planning".to_string(),
            category: LessonCategory::Strategy,
            difficulty: Difficulty::Advanced,
            description: "How to create and execute long-term strategic plans in the middlegame.".to_string(),
            content: vec![
                LessonSection {
                    title: "Evaluating the Position".to_string(),
                    content: "Before forming a plan, evaluate: material balance, king safety, pawn structure, piece activity, and control of key squares/files. This evaluation tells you what type of plan to pursue.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "Creating a Plan".to_string(),
                    content: "A plan should be based on the features of the position. If you have a space advantage, avoid trades. If you have better development, open the position. If your pawns are better, go into the endgame.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "Prophylactic Thinking".to_string(),
                    content: "Always ask: 'What does my opponent want to do?' Prophylaxis means preventing the opponent's plans before they can execute them. This is one of the most valuable skills at the advanced level.".to_string(),
                    fen: None,
                    moves: None,
                },
            ],
            completed: false,
        },

        // === ENDGAME LESSONS ===
        Lesson {
            id: "end-01".to_string(),
            title: "King and Pawn Endgames".to_string(),
            category: LessonCategory::Endgame,
            difficulty: Difficulty::Beginner,
            description: "The most fundamental endgames every player must know.".to_string(),
            content: vec![
                LessonSection {
                    title: "The Opposition".to_string(),
                    content: "Opposition is when two kings stand on the same file or rank with one square between them. The player who does NOT have to move has the opposition and usually the advantage in king and pawn endings.".to_string(),
                    fen: Some("8/8/8/4k3/8/4K3/4P3/8 w - - 0 1".to_string()),
                    moves: None,
                },
                LessonSection {
                    title: "Key Squares".to_string(),
                    content: "Every pawn has key squares. If your king reaches these squares, the pawn will promote. For a pawn on e4, the key squares are d6, e6, and f6. Understanding key squares is essential for pawn endgames.".to_string(),
                    fen: Some("8/8/8/8/4P3/8/8/4K2k w - - 0 1".to_string()),
                    moves: None,
                },
                LessonSection {
                    title: "The Square Rule".to_string(),
                    content: "Can the king catch a passed pawn? Draw a square from the pawn to the promotion square. If the defending king can step into this square, it catches the pawn. A quick visual tool for calculating pawn races.".to_string(),
                    fen: None,
                    moves: None,
                },
            ],
            completed: false,
        },
        Lesson {
            id: "end-02".to_string(),
            title: "Rook Endgames".to_string(),
            category: LessonCategory::Endgame,
            difficulty: Difficulty::Intermediate,
            description: "Rook endgames occur in about 50% of all games. Master the key techniques.".to_string(),
            content: vec![
                LessonSection {
                    title: "Lucena Position".to_string(),
                    content: "The Lucena position is the most important winning technique in rook endgames. With your pawn on the 7th rank and king in front of it, use the 'bridge' technique to escort the pawn to promotion.".to_string(),
                    fen: Some("1K1k4/1P6/8/8/8/8/1r6/5R2 w - - 0 1".to_string()),
                    moves: Some(vec!["Rf4".into(), "Rc2".into(), "Ka7".into(), "Ra2+".into(), "Kb6".into(), "Rb2+".into(), "Ka6".into(), "Ra2+".into(), "Kb5".into(), "Rb2+".into(), "Rb4".into()]),
                },
                LessonSection {
                    title: "Philidor Position".to_string(),
                    content: "The Philidor position is the most important drawing technique. Keep your rook on the third rank (cutting off the enemy king), then switch to checking from behind when the pawn advances.".to_string(),
                    fen: Some("4k3/8/8/4pK2/8/4R3/8/3r4 w - - 0 1".to_string()),
                    moves: None,
                },
                LessonSection {
                    title: "Active Rook Placement".to_string(),
                    content: "In rook endgames, an active rook is crucial. Place your rook behind passed pawns (both yours and your opponent's). 'Rooks belong behind passed pawns' - Siegbert Tarrasch.".to_string(),
                    fen: None,
                    moves: None,
                },
            ],
            completed: false,
        },
        Lesson {
            id: "end-03".to_string(),
            title: "Bishop vs Knight Endgames".to_string(),
            category: LessonCategory::Endgame,
            difficulty: Difficulty::Intermediate,
            description: "When is a bishop better than a knight, and vice versa?".to_string(),
            content: vec![
                LessonSection {
                    title: "Bishop Advantages".to_string(),
                    content: "Bishops excel in open positions with pawns on both sides of the board. They can control long diagonals and coordinate with a far-away king. The bishop pair is a significant advantage.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "Knight Advantages".to_string(),
                    content: "Knights prefer closed positions with fixed pawns. They can access both color squares and are excellent blockaders. In endgames with pawns on only one side, the knight can be superior.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "Good Bishop vs Bad Bishop".to_string(),
                    content: "A 'good' bishop has most of its pawns on the opposite color. A 'bad' bishop is blocked by its own pawns. Converting a bad bishop into a good one can decide the game.".to_string(),
                    fen: None,
                    moves: None,
                },
            ],
            completed: false,
        },
        Lesson {
            id: "end-04".to_string(),
            title: "Queen Endgames".to_string(),
            category: LessonCategory::Endgame,
            difficulty: Difficulty::Advanced,
            description: "Complex but crucial - queen endgames require precision and pattern knowledge.".to_string(),
            content: vec![
                LessonSection {
                    title: "Queen vs Pawn on 7th Rank".to_string(),
                    content: "When a pawn reaches the 7th rank, the queen can usually stop it - but not always! Bishop and rook pawns on the 7th rank with the king nearby can draw because of stalemate tricks.".to_string(),
                    fen: Some("8/1P6/8/K7/8/8/8/3q2k1 w - - 0 1".to_string()),
                    moves: None,
                },
                LessonSection {
                    title: "Perpetual Check Patterns".to_string(),
                    content: "In queen endgames, perpetual check is always a defensive resource. Learn to recognize when the position allows a draw by perpetual and when the stronger side can escape the checks.".to_string(),
                    fen: None,
                    moves: None,
                },
            ],
            completed: false,
        },
        Lesson {
            id: "end-05".to_string(),
            title: "Practical Endgame Principles".to_string(),
            category: LessonCategory::Endgame,
            difficulty: Difficulty::Beginner,
            description: "General principles that apply across all endgame types.".to_string(),
            content: vec![
                LessonSection {
                    title: "Activate Your King".to_string(),
                    content: "In the endgame, the king becomes a powerful piece. Bring it to the center/action. The king should actively support your pawns and attack your opponent's weaknesses.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "Create Passed Pawns".to_string(),
                    content: "A passed pawn (no opposing pawn can block it) is a powerful asset. Create passed pawns by exchanging pawns, and then the opponent will need to use pieces to stop it.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "The Principle of Two Weaknesses".to_string(),
                    content: "One weakness can often be defended. To win, create a second weakness on the other side of the board. The opponent cannot defend both simultaneously. This is a key winning technique.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "Zugzwang".to_string(),
                    content: "A position where any move worsens the player's situation. Zugzwang is common in endgames and can be a decisive weapon. Learn to recognize and create zugzwang positions.".to_string(),
                    fen: Some("8/8/1p2k3/1P2p3/1PK1P3/8/8/8 w - - 0 1".to_string()),
                    moves: None,
                },
            ],
            completed: false,
        },

        // === OPENING PRINCIPLES ===
        Lesson {
            id: "open-01".to_string(),
            title: "Opening Principles".to_string(),
            category: LessonCategory::Opening,
            difficulty: Difficulty::Beginner,
            description: "Master the fundamental principles that guide good opening play.".to_string(),
            content: vec![
                LessonSection {
                    title: "Control the Center".to_string(),
                    content: "The center (e4, d4, e5, d5) is the most important area of the board. Pieces in or near the center control more squares and can quickly shift to either side. Control it with pawns and pieces.".to_string(),
                    fen: Some("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1".to_string()),
                    moves: None,
                },
                LessonSection {
                    title: "Develop Your Pieces".to_string(),
                    content: "In the opening, develop knights and bishops to active squares as quickly as possible. Generally, develop knights before bishops. Avoid moving the same piece twice without a good reason.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "King Safety".to_string(),
                    content: "Castle early to get your king to safety. Usually, kingside castling is preferred because it's faster. Don't open lines near your own king unless you have a concrete attacking plan.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "Common Opening Mistakes".to_string(),
                    content: "Don't move too many pawns, don't bring the queen out too early, don't move the same piece repeatedly, and don't neglect development for small advantages.".to_string(),
                    fen: None,
                    moves: None,
                },
            ],
            completed: false,
        },

        // === POSITIONAL PLAY ===
        Lesson {
            id: "pos-01".to_string(),
            title: "Positional Chess Basics".to_string(),
            category: LessonCategory::Positional,
            difficulty: Difficulty::Intermediate,
            description: "Learn to play positionally - improve your position step by step without immediate tactical threats.".to_string(),
            content: vec![
                LessonSection {
                    title: "Weak Squares".to_string(),
                    content: "Weak squares are squares that can no longer be defended by pawns. They become outposts for enemy pieces, especially knights. Identify and exploit weak squares in your opponent's camp.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "Open Files and Diagonals".to_string(),
                    content: "Control of open files (by rooks) and diagonals (by bishops) provides lasting advantages. Occupy open files with your rooks and try to penetrate into the opponent's position.".to_string(),
                    fen: None,
                    moves: None,
                },
                LessonSection {
                    title: "The Exchange".to_string(),
                    content: "Knowing when to exchange pieces is crucial. Exchange pieces when: you have a material advantage, you want to relieve pressure, or you want to transition into a favorable endgame.".to_string(),
                    fen: None,
                    moves: None,
                },
            ],
            completed: false,
        },
    ]
}

pub fn get_lessons_by_category(category: &str) -> Vec<Lesson> {
    let all = get_all_lessons();
    match category {
        "opening" => all.into_iter().filter(|l| matches!(l.category, LessonCategory::Opening)).collect(),
        "middlegame" => all.into_iter().filter(|l| matches!(l.category, LessonCategory::Middlegame)).collect(),
        "endgame" => all.into_iter().filter(|l| matches!(l.category, LessonCategory::Endgame)).collect(),
        "tactics" => all.into_iter().filter(|l| matches!(l.category, LessonCategory::Tactics)).collect(),
        "strategy" => all.into_iter().filter(|l| matches!(l.category, LessonCategory::Strategy)).collect(),
        "positional" => all.into_iter().filter(|l| matches!(l.category, LessonCategory::Positional)).collect(),
        _ => all,
    }
}
