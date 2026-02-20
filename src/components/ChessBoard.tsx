import { useMemo, useState } from "react";
import { renderPiece } from "./ChessPieces";

interface MoveAnnotation {
    classification: string;
    comment?: string;
    san: string;
    moveNumber: number;
    color: string;
}

export interface Arrow {
    from: string;
    to: string;
    color: string;
}

interface ChessBoardProps {
    fen?: string;
    size?: number;
    flipped?: boolean;
    highlightSquares?: string[];
    lastMove?: { from: string; to: string };
    currentAnnotation?: MoveAnnotation | null;
    arrows?: Arrow[];
    onAskCoach?: () => void;
    loadingCoach?: boolean;
    evalScore?: number;
}

const CLASSIFICATION_STYLES: Record<
    string,
    { emoji: string; color: string; bg: string; glow: string; border: string }
> = {
    Brilliant: {
        emoji: "💎",
        color: "#67e8f9",
        bg: "rgba(103, 232, 249, 0.12)",
        glow: "0 0 20px rgba(103, 232, 249, 0.4)",
        border: "rgba(103, 232, 249, 0.25)",
    },
    Great: {
        emoji: "⭐",
        color: "#60a5fa",
        bg: "rgba(96, 165, 250, 0.12)",
        glow: "0 0 16px rgba(96, 165, 250, 0.3)",
        border: "rgba(96, 165, 250, 0.25)",
    },
    Best: {
        emoji: "✅",
        color: "#34d399",
        bg: "rgba(52, 211, 153, 0.12)",
        glow: "0 0 12px rgba(52, 211, 153, 0.2)",
        border: "rgba(52, 211, 153, 0.2)",
    },
    Good: {
        emoji: "👍",
        color: "#a3e635",
        bg: "rgba(163, 230, 53, 0.08)",
        glow: "none",
        border: "rgba(163, 230, 53, 0.15)",
    },
    Book: {
        emoji: "📖",
        color: "#fbbf24",
        bg: "rgba(251, 191, 36, 0.08)",
        glow: "none",
        border: "rgba(251, 191, 36, 0.15)",
    },
    Inaccuracy: {
        emoji: "⚠️",
        color: "#facc15",
        bg: "rgba(250, 204, 21, 0.12)",
        glow: "0 0 12px rgba(250, 204, 21, 0.2)",
        border: "rgba(250, 204, 21, 0.2)",
    },
    Mistake: {
        emoji: "❌",
        color: "#fb923c",
        bg: "rgba(251, 146, 60, 0.12)",
        glow: "0 0 16px rgba(251, 146, 60, 0.3)",
        border: "rgba(251, 146, 60, 0.25)",
    },
    Blunder: {
        emoji: "💀",
        color: "#f87171",
        bg: "rgba(248, 113, 113, 0.15)",
        glow: "0 0 24px rgba(248, 113, 113, 0.5)",
        border: "rgba(248, 113, 113, 0.3)",
    },
    ForcedMove: {
        emoji: "🔒",
        color: "#94a3b8",
        bg: "rgba(148, 163, 184, 0.08)",
        glow: "none",
        border: "rgba(148, 163, 184, 0.15)",
    },
};

const DEFAULT_FEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function parseFen(fen: string): (string | null)[][] {
    const rows = fen.split(" ")[0].split("/");
    const board: (string | null)[][] = [];

    for (const row of rows) {
        const boardRow: (string | null)[] = [];
        for (const char of row) {
            if (/[1-8]/.test(char)) {
                for (let i = 0; i < parseInt(char); i++) {
                    boardRow.push(null);
                }
            } else {
                boardRow.push(char);
            }
        }
        board.push(boardRow);
    }

    return board;
}

// Helper to get coordinates [col, row] 0-7 from square name "e4"
function getSquareCoords(square: string, flipped: boolean): { x: number; y: number } {
    const col = square.charCodeAt(0) - 97; // 'a' -> 0
    const row = 8 - parseInt(square[1]); // '8' -> 0

    const displayCol = flipped ? 7 - col : col;
    const displayRow = flipped ? 7 - row : row;

    return { x: displayCol, y: displayRow };
}

export function ChessBoard({
    fen = DEFAULT_FEN,
    size = 560,
    flipped = false,
    highlightSquares = [],
    lastMove,
    currentAnnotation,
    arrows = [],
    onAskCoach,
    loadingCoach = false,
    evalScore,
}: ChessBoardProps) {
    const board = useMemo(() => parseFen(fen), [fen]);
    const squareSize = size / 8;
    const [hoveredAnnotation, setHoveredAnnotation] = useState(false);

    const highlightSet = useMemo(() => {
        const set = new Set<string>();
        highlightSquares.forEach((sq) => set.add(sq));
        if (lastMove) {
            set.add(lastMove.from);
            set.add(lastMove.to);
        }
        return set;
    }, [highlightSquares, lastMove]);

    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

    const displayFiles = flipped ? [...files].reverse() : files;
    const displayRanks = flipped ? [...ranks].reverse() : ranks;

    const annotationStyle = currentAnnotation
        ? CLASSIFICATION_STYLES[currentAnnotation.classification]
        : null;

    const pieceSize = Math.round(squareSize * 0.88);

    return (
        <div className="relative inline-flex select-none" style={{ width: size + (evalScore !== undefined ? 28 : 0) }}>
            {/* Eval Bar — chess.com style */}
            {evalScore !== undefined && (() => {
                // Convert eval to white percentage (50% = equal)
                // Use sigmoid-like mapping: eval of ±5 maps to ~95%/5%
                const whitePercent = Math.min(97, Math.max(3,
                    50 + (evalScore / (1 + Math.abs(evalScore / 4))) * 25
                ));
                const displayEval = Math.abs(evalScore);
                const isWhiteAdvantage = evalScore > 0;
                const evalText = displayEval >= 10 ? `${displayEval >= 10 ? Math.round(displayEval) : displayEval.toFixed(1)}` : displayEval.toFixed(1);
                const barWhitePercent = flipped ? (100 - whitePercent) : whitePercent;
                return (
                    <div
                        className="relative rounded-l-md overflow-hidden shrink-0 mr-0"
                        style={{ width: 24, height: size }}
                    >
                        {/* Black section (top when not flipped) */}
                        <div
                            className="absolute top-0 left-0 right-0 bg-zinc-800 transition-all duration-500 ease-out flex items-start justify-center"
                            style={{ height: `${100 - barWhitePercent}%` }}
                        >
                            {!isWhiteAdvantage && (
                                <span className="text-[9px] font-bold text-white/80 mt-1 leading-none">
                                    {evalText}
                                </span>
                            )}
                        </div>
                        {/* White section (bottom when not flipped) */}
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-gray-100 transition-all duration-500 ease-out flex items-end justify-center"
                            style={{ height: `${barWhitePercent}%` }}
                        >
                            {isWhiteAdvantage && (
                                <span className="text-[9px] font-bold text-zinc-800 mb-1 leading-none">
                                    {evalText}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })()}

            <div className="relative inline-block" style={{ width: size }}>
                {/* Move Annotation Overlay - ABOVE the board */}
                {currentAnnotation && annotationStyle && (
                    <div
                        className="absolute left-0 right-0 flex justify-center z-20"
                        style={{ top: -8, transform: "translateY(-100%)" }}
                    >
                        <div
                            className="relative cursor-pointer"
                            onMouseEnter={() => setHoveredAnnotation(true)}
                            onMouseLeave={() => setHoveredAnnotation(false)}
                        >
                            {/* Main badge */}
                            <div
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl backdrop-blur-md border transition-all duration-200"
                                style={{
                                    backgroundColor: annotationStyle.bg,
                                    borderColor: annotationStyle.border,
                                    boxShadow: hoveredAnnotation
                                        ? `0 8px 32px ${annotationStyle.color}20, 0 0 0 1px ${annotationStyle.border}`
                                        : `0 4px 16px rgba(0,0,0,0.3)`,
                                    transform: hoveredAnnotation ? "scale(1.03)" : "scale(1)",
                                }}
                            >
                                <span className="text-lg">{annotationStyle.emoji}</span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="font-bold text-sm"
                                            style={{ color: annotationStyle.color }}
                                        >
                                            {currentAnnotation.classification}
                                        </span>
                                        {evalScore !== undefined && (
                                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-white/70">
                                                {evalScore > 0 ? "+" : ""}{evalScore.toFixed(1)}
                                            </span>
                                        )}
                                        <span className="text-white/60 text-xs font-mono">
                                            {currentAnnotation.moveNumber}.
                                            {currentAnnotation.color === "black" ? ".." : ""}{" "}
                                            {currentAnnotation.san}
                                        </span>
                                    </div>
                                    {currentAnnotation.comment && (
                                        <p
                                            className="text-xs mt-0.5 max-w-[360px] leading-relaxed transition-opacity"
                                            style={{
                                                color: `${annotationStyle.color}cc`,
                                                opacity: hoveredAnnotation ? 1 : 0.8,
                                            }}
                                        >
                                            {currentAnnotation.comment}
                                        </p>
                                    )}
                                </div>
                                {/* Ask Coach button */}
                                {onAskCoach && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAskCoach(); }}
                                        disabled={loadingCoach}
                                        className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-150 border"
                                        style={{
                                            color: '#a5b4fc',
                                            borderColor: 'rgba(165, 180, 252, 0.2)',
                                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.25)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                                        }}
                                    >
                                        {loadingCoach ? (
                                            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
                                            </svg>
                                        ) : (
                                            <span>💡</span>
                                        )}
                                        {loadingCoach ? '...' : 'Coach'}
                                    </button>
                                )}
                            </div>

                            {/* Arrow pointing down to the board */}
                            <div
                                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                                style={{
                                    backgroundColor: annotationStyle.bg,
                                    borderRight: `1px solid ${annotationStyle.border}`,
                                    borderBottom: `1px solid ${annotationStyle.border}`,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Board & Pieces */}
                <div
                    className="relative rounded-xl overflow-hidden"
                    style={{
                        width: size,
                        height: size,
                        boxShadow:
                            annotationStyle?.glow !== "none"
                                ? `${annotationStyle?.glow}, 0 25px 50px -12px rgba(0,0,0,0.5)`
                                : "0 25px 50px -12px rgba(0,0,0,0.5)",
                        transition: "box-shadow 0.3s ease",
                    }}
                >
                    {/* Border gradient */}
                    <div
                        className="absolute inset-0 rounded-xl"
                        style={{
                            background: annotationStyle
                                ? `linear-gradient(135deg, ${annotationStyle.color}40, transparent, ${annotationStyle.color}20)`
                                : "linear-gradient(135deg, #2a1a0e 0%, #1a1a2e 50%, #2a1a0e 100%)",
                            padding: "2px",
                            transition: "background 0.3s ease",
                        }}
                    >
                        <div className="relative w-full h-full rounded-xl overflow-hidden">
                            {displayRanks.map((rank, displayRow) => {
                                const actualRow = flipped ? 7 - displayRow : displayRow;
                                return displayFiles.map((file, displayCol) => {
                                    const actualCol = flipped ? 7 - displayCol : displayCol;
                                    const isLight = (actualRow + actualCol) % 2 === 0;
                                    const piece = board[actualRow]?.[actualCol];
                                    const squareName = `${file}${rank}`;
                                    const isHighlighted = highlightSet.has(squareName);

                                    // Classic wood-toned board colors
                                    const lightBase = "#F0D9B5";
                                    const darkBase = "#B58863";
                                    const lightHighlight = "#F7EC7A";
                                    const darkHighlight = "#DAC34B";

                                    const bgColor = isHighlighted
                                        ? isLight
                                            ? lightHighlight
                                            : darkHighlight
                                        : isLight
                                            ? lightBase
                                            : darkBase;

                                    return (
                                        <div
                                            key={squareName}
                                            className="absolute flex items-center justify-center"
                                            style={{
                                                width: squareSize,
                                                height: squareSize,
                                                left: displayCol * squareSize,
                                                top: displayRow * squareSize,
                                                backgroundColor: bgColor,
                                                transition: "background-color 0.15s ease",
                                            }}
                                        >
                                            {/* Coordinate labels */}
                                            {displayCol === 0 && (
                                                <span
                                                    className="absolute top-[2px] left-[3px] font-bold pointer-events-none"
                                                    style={{
                                                        fontSize: Math.max(9, squareSize * 0.16),
                                                        color: isLight ? darkBase : lightBase,
                                                        opacity: 0.75,
                                                    }}
                                                >
                                                    {rank}
                                                </span>
                                            )}
                                            {displayRow === 7 && (
                                                <span
                                                    className="absolute bottom-[1px] right-[3px] font-bold pointer-events-none"
                                                    style={{
                                                        fontSize: Math.max(9, squareSize * 0.16),
                                                        color: isLight ? darkBase : lightBase,
                                                        opacity: 0.75,
                                                    }}
                                                >
                                                    {file}
                                                </span>
                                            )}

                                            {/* Piece - Inline SVG */}
                                            {piece && (
                                                <div
                                                    className="select-none pointer-events-none flex items-center justify-center relative z-10"
                                                    style={{
                                                        width: pieceSize,
                                                        height: pieceSize,
                                                        filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))",
                                                    }}
                                                >
                                                    {renderPiece(piece, pieceSize)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })}

                            {/* Arrows Overlay */}
                            {arrows && arrows.length > 0 && (() => {
                                const arrowWidth = squareSize * 0.28;
                                const headLength = squareSize * 0.45;
                                const headWidth = squareSize * 0.55;
                                // Offset from center so arrows don't sit on pieces
                                const startOffset = squareSize * 0.15;
                                const endOffset = squareSize * 0.05;

                                // Sort: render "bad" (red/orange) arrows first, green on top
                                const sorted = [...arrows].sort((a, b) => {
                                    const isGreen = (c: string) => c.includes("34d399") || c.includes("a3e635");
                                    return (isGreen(a.color) ? 1 : 0) - (isGreen(b.color) ? 1 : 0);
                                });

                                return (
                                    <svg
                                        className="absolute inset-0 pointer-events-none"
                                        width={size}
                                        height={size}
                                        viewBox={`0 0 ${size} ${size}`}
                                        style={{ zIndex: 15 }}
                                    >
                                        <defs>
                                            <filter id="arrow-glow" x="-50%" y="-50%" width="200%" height="200%">
                                                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                                                <feMerge>
                                                    <feMergeNode in="blur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        {sorted.map((arrow, i) => {
                                            const start = getSquareCoords(arrow.from, flipped);
                                            const end = getSquareCoords(arrow.to, flipped);

                                            const cx1 = start.x * squareSize + squareSize / 2;
                                            const cy1 = start.y * squareSize + squareSize / 2;
                                            const cx2 = end.x * squareSize + squareSize / 2;
                                            const cy2 = end.y * squareSize + squareSize / 2;

                                            // Calculate direction vector
                                            const dx = cx2 - cx1;
                                            const dy = cy2 - cy1;
                                            const len = Math.sqrt(dx * dx + dy * dy);
                                            if (len < 1) return null;

                                            const ndx = dx / len;
                                            const ndy = dy / len;

                                            // perpendicular
                                            const px = -ndy;
                                            const py = ndx;

                                            // Offset start/end points
                                            const x1 = cx1 + ndx * startOffset;
                                            const y1 = cy1 + ndy * startOffset;
                                            const x2 = cx2 - ndx * endOffset;
                                            const y2 = cy2 - ndy * endOffset;

                                            // Arrow tip point
                                            const tipX = x2;
                                            const tipY = y2;

                                            // Arrow body end (where head starts)
                                            const bodyEndX = x2 - ndx * headLength;
                                            const bodyEndY = y2 - ndy * headLength;

                                            // Build arrow shape: body rect + triangle head
                                            const hw = arrowWidth / 2;
                                            const hhw = headWidth / 2;

                                            const path = [
                                                // Start of body (left side)
                                                `M ${x1 + px * hw} ${y1 + py * hw}`,
                                                // Body left edge to head junction
                                                `L ${bodyEndX + px * hw} ${bodyEndY + py * hw}`,
                                                // Head left wing
                                                `L ${bodyEndX + px * hhw} ${bodyEndY + py * hhw}`,
                                                // Tip
                                                `L ${tipX} ${tipY}`,
                                                // Head right wing
                                                `L ${bodyEndX - px * hhw} ${bodyEndY - py * hhw}`,
                                                // Back to body right edge
                                                `L ${bodyEndX - px * hw} ${bodyEndY - py * hw}`,
                                                // Body right edge back to start
                                                `L ${x1 - px * hw} ${y1 - py * hw}`,
                                                `Z`,
                                            ].join(" ");

                                            return (
                                                <path
                                                    key={i}
                                                    d={path}
                                                    fill={arrow.color}
                                                    opacity={0.82}
                                                    filter="url(#arrow-glow)"
                                                    style={{
                                                        transition: "opacity 0.2s ease",
                                                    }}
                                                />
                                            );
                                        })}
                                    </svg>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
