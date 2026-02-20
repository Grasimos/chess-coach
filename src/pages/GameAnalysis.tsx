import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { ChessBoard, Arrow } from "@/components/ChessBoard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    RefreshCw,
    Sparkles,
    Star,
    Target,
    ThumbsUp,
    AlertTriangle,
    XCircle,
    Ban,
    BookOpen,
    Lock,
    Database,
    Download,
} from "lucide-react";
import {
    fetchRecentGames,
    getSavedGames,
    getGameCount,
    analyzeGame,
    getCoachComment,
    type ChessComGame,
    type GameAnalysis as GameAnalysisType,
} from "@/lib/api";
import { MessageCircle, Zap } from "lucide-react";

const classificationConfig: Record<
    string,
    { icon: React.ReactNode; color: string; bg: string; label: string }
> = {
    Brilliant: {
        icon: <Sparkles className="w-3 h-3" />,
        color: "text-cyan-300",
        bg: "bg-cyan-500/10",
        label: "Brilliant",
    },
    Great: {
        icon: <Star className="w-3 h-3" />,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        label: "Great",
    },
    Best: {
        icon: <Target className="w-3 h-3" />,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        label: "Best",
    },
    Good: {
        icon: <ThumbsUp className="w-3 h-3" />,
        color: "text-lime-400",
        bg: "bg-lime-500/10",
        label: "Good",
    },
    Book: {
        icon: <BookOpen className="w-3 h-3" />,
        color: "text-amber-300",
        bg: "bg-amber-500/10",
        label: "Book",
    },
    Inaccuracy: {
        icon: <AlertTriangle className="w-3 h-3" />,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        label: "Inaccuracy",
    },
    Mistake: {
        icon: <XCircle className="w-3 h-3" />,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        label: "Mistake",
    },
    Blunder: {
        icon: <Ban className="w-3 h-3" />,
        color: "text-red-400",
        bg: "bg-red-500/10",
        label: "Blunder",
    },
    ForcedMove: {
        icon: <Lock className="w-3 h-3" />,
        color: "text-slate-400",
        bg: "bg-slate-500/10",
        label: "Forced",
    },
};

export function GameAnalysis() {
    const [games, setGames] = useState<ChessComGame[]>([]);
    const [selectedGame, setSelectedGame] = useState<ChessComGame | null>(null);
    const [analysis, setAnalysis] = useState<GameAnalysisType | null>(null);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [loadingGames, setLoadingGames] = useState(false);
    const [analyzingGame, setAnalyzingGame] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dbGameCount, setDbGameCount] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const [coachComment, setCoachComment] = useState<string | null>(null);
    const [loadingCoach, setLoadingCoach] = useState(false);
    const [coachDialogOpen, setCoachDialogOpen] = useState(false);

    // Clear coach comment when navigating to a different move
    useEffect(() => {
        setCoachComment(null);
    }, [currentMoveIndex]);

    const savedUsername = localStorage.getItem("chess_username");

    useEffect(() => {
        if (savedUsername) {
            loadSavedGames();
            loadGameCount();
        }
    }, []);

    // Keyboard navigation
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (!analysis) return;
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                setCurrentMoveIndex((prev) => Math.max(-1, prev - 1));
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                setCurrentMoveIndex((prev) =>
                    Math.min(analysis.moves.length - 1, prev + 1)
                );
            } else if (e.key === "Home") {
                e.preventDefault();
                setCurrentMoveIndex(-1);
            } else if (e.key === "End") {
                e.preventDefault();
                setCurrentMoveIndex(analysis.moves.length - 1);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [analysis]);

    async function loadSavedGames() {
        if (!savedUsername) return;
        setLoadingGames(true);
        try {
            const g = await getSavedGames(savedUsername, 50);
            setGames(g);
        } catch {
            // First load might fail if no DB yet
        } finally {
            setLoadingGames(false);
        }
    }

    async function loadGameCount() {
        if (!savedUsername) return;
        try {
            const count = await getGameCount(savedUsername);
            setDbGameCount(count);
        } catch {
            // ignore
        }
    }

    async function syncGames() {
        if (!savedUsername) return;
        setSyncing(true);
        setError(null);
        try {
            const g = await fetchRecentGames(savedUsername, 50);
            setGames(g);
            await loadGameCount();
        } catch (e) {
            setError(String(e));
        } finally {
            setSyncing(false);
        }
    }

    async function handleAnalyze(game: ChessComGame) {
        if (!game.pgn) return;
        setSelectedGame(game);
        setAnalyzingGame(true);
        setCurrentMoveIndex(-1);
        setError(null);
        try {
            const result = await analyzeGame(
                game.pgn,
                game.white.username,
                game.black.username,
                game.white.result === "win"
                    ? "1-0"
                    : game.black.result === "win"
                        ? "0-1"
                        : "1/2-1/2",
                game.time_control || "unknown",
                game.time_class || "unknown",
                game.url,
                game.end_time || 0
            );
            setAnalysis(result);
        } catch (e) {
            setError(String(e));
        } finally {
            setAnalyzingGame(false);
        }
    }

    function getCurrentFen(): string {
        if (!analysis || currentMoveIndex < 0) {
            return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        }
        return (
            analysis.moves[currentMoveIndex]?.fen_after ||
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        );
    }

    function getCurrentAnnotation() {
        if (!analysis || currentMoveIndex < 0) return null;
        const move = analysis.moves[currentMoveIndex];
        if (!move) return null;
        return {
            classification: move.classification,
            comment: move.comment || undefined,
            san: move.san,
            moveNumber: move.move_number,
            color: move.color,
        };
    }

    async function requestCoachComment() {
        if (!analysis || currentMoveIndex < 0 || loadingCoach) return;
        const move = analysis.moves[currentMoveIndex];
        if (!move) return;

        setLoadingCoach(true);
        try {
            const comment = await getCoachComment(
                analysis.game_url,
                currentMoveIndex,
                move.fen_before,
                move.san,
                move.best_move_san || null,
                move.classification,
                move.color,
                move.move_number
            );
            setCoachComment(comment);
            setCoachDialogOpen(true);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setCoachComment(`⚠️ ${msg}`);
            setCoachDialogOpen(true);
        } finally {
            setLoadingCoach(false);
        }
    }


    function getResultBadge(game: ChessComGame): React.ReactNode {
        const isWhite =
            game.white.username.toLowerCase() === savedUsername?.toLowerCase();
        const myResult = isWhite ? game.white.result : game.black.result;

        if (myResult === "win")
            return (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5">
                    W
                </Badge>
            );
        if (
            myResult === "lose" ||
            myResult === "checkmated" ||
            myResult === "timeout" ||
            myResult === "resigned" ||
            myResult === "abandoned"
        )
            return (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1.5">
                    L
                </Badge>
            );
        return (
            <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-[10px] px-1.5">
                D
            </Badge>
        );
    }

    function formatTimeControl(tc?: string): string {
        if (!tc) return "?";
        const parts = tc.split("+");
        const base = parseInt(parts[0]);
        const inc = parts[1] ? parseInt(parts[1]) : 0;
        const mins = Math.floor(base / 60);
        return inc > 0 ? `${mins}+${inc}` : `${mins}m`;
    }

    // Group moves into pairs for display
    const movePairs = analysis
        ? Array.from(
            { length: Math.ceil(analysis.moves.length / 2) },
            (_, i) => ({
                number: i + 1,
                white: analysis.moves[i * 2],
                whiteIdx: i * 2,
                black: analysis.moves[i * 2 + 1],
                blackIdx: i * 2 + 1,
            })
        )
        : [];

    const getCurrentArrows = (): Arrow[] => {
        if (!analysis || currentMoveIndex < 0) return [];
        const move = analysis.moves[currentMoveIndex];
        if (!move) return [];

        const arrows: Arrow[] = [];

        // Arrow for the played move
        if (move.played_from && move.played_to) {
            let color = "#cbd5e1"; // Default Grey

            switch (move.classification) {
                case "Brilliant": color = "#22d3ee"; break; // Cyan
                case "Great": color = "#60a5fa"; break; // Blue
                case "Best": color = "#34d399"; break; // Green
                case "Good": color = "#a3e635"; break; // Lime
                case "Mistake": color = "#fb923c"; break; // Orange
                case "Blunder": color = "#f87171"; break; // Red
                case "Inaccuracy": color = "#facc15"; break; // Yellow
            }
            // Force red/orange for bad moves to highlight error
            if (move.classification === "Mistake") color = "#fb923c";
            if (move.classification === "Blunder") color = "#f87171";

            arrows.push({
                from: move.played_from,
                to: move.played_to,
                color
            });
        }

        // Arrow for the best move (if move was bad)
        // Only show if different from played move (which it should be if bad)
        if (move.best_from && move.best_to) {
            arrows.push({
                from: move.best_from,
                to: move.best_to,
                color: "#34d399" // Green for solution
            });
        }

        return arrows;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Game Analysis</h2>
                    <p className="text-sm text-muted-foreground">
                        {dbGameCount > 0 && (
                            <span className="inline-flex items-center gap-1">
                                <Database className="w-3 h-3" />
                                {dbGameCount} games saved
                            </span>
                        )}
                    </p>
                </div>
                {savedUsername && (
                    <Button
                        onClick={syncGames}
                        disabled={syncing}
                        variant="outline"
                        size="sm"
                        className="border-white/10 gap-2"
                    >
                        {syncing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        Sync New Games
                    </Button>
                )}
            </div>

            {!savedUsername && (
                <Card className="bg-card/50 border-white/5">
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground">
                            Connect your Chess.com account from the Dashboard first
                        </p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="py-3 px-4">
                        <p className="text-destructive text-sm">{error}</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Games List - Compact */}
                <div className="lg:col-span-3">
                    <Card className="bg-card/50 backdrop-blur border-white/5">
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm">
                                Recent Games ({games.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[calc(100vh-220px)]">
                                <div className="px-2 pb-2 space-y-0.5">
                                    {games.map((game, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAnalyze(game)}
                                            className={`w-full text-left p-2 rounded-lg transition-all duration-150 ${selectedGame?.url === game.url
                                                ? "bg-indigo-500/10 border border-indigo-500/30"
                                                : "hover:bg-white/5 border border-transparent"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {getResultBadge(game)}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate">
                                                        vs{" "}
                                                        {game.white.username.toLowerCase() ===
                                                            savedUsername?.toLowerCase()
                                                            ? game.black.username
                                                            : game.white.username}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                        <span className="uppercase">
                                                            {game.time_class?.slice(0, 3)}
                                                        </span>
                                                        <span>{formatTimeControl(game.time_control)}</span>
                                                        <span>
                                                            {game.end_time
                                                                ? new Date(
                                                                    game.end_time * 1000
                                                                ).toLocaleDateString("el-GR", {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                })
                                                                : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    {games.length === 0 && !loadingGames && savedUsername && (
                                        <div className="text-center py-8 px-4">
                                            <Download className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                            <p className="text-xs text-muted-foreground">
                                                Click "Sync New Games" to fetch from Chess.com
                                            </p>
                                        </div>
                                    )}
                                    {loadingGames && (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Analysis Area */}
                <div className="lg:col-span-9">
                    {analyzingGame && (
                        <Card className="bg-card/50 backdrop-blur border-white/5">
                            <CardContent className="flex items-center justify-center py-32">
                                <div className="text-center space-y-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto" />
                                    <p className="text-muted-foreground">Analyzing game...</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {analysis && !analyzingGame && (
                        <div className="space-y-4">
                            {/* Board + Compact Move List side by side */}
                            <div className="flex gap-4 items-start">
                                {/* Chess Board - Large & Prominent */}
                                <div className="flex flex-col items-center gap-1 shrink-0 pt-14">
                                    {/* Black player info */}
                                    <div className="w-full flex items-center justify-between px-1 py-1">
                                        <span className="text-sm font-medium">
                                            {savedUsername?.toLowerCase() ===
                                                analysis.black.toLowerCase()
                                                ? analysis.white
                                                : analysis.black}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] border-white/10"
                                        >
                                            {analysis.time_class.toUpperCase()}
                                        </Badge>
                                    </div>

                                    <ChessBoard
                                        fen={getCurrentFen()}
                                        size={520}
                                        flipped={
                                            savedUsername?.toLowerCase() ===
                                            analysis.black.toLowerCase()
                                        }
                                        currentAnnotation={getCurrentAnnotation()}
                                        arrows={getCurrentArrows()}
                                        onAskCoach={requestCoachComment}
                                        loadingCoach={loadingCoach}
                                        evalScore={currentMoveIndex >= 0 && analysis.moves[currentMoveIndex] ? analysis.moves[currentMoveIndex].eval_score : undefined}
                                    />

                                    {/* White player info */}
                                    <div className="w-full flex items-center justify-between px-1 py-1">
                                        <span className="text-sm font-medium">
                                            {savedUsername?.toLowerCase() ===
                                                analysis.white.toLowerCase()
                                                ? analysis.white
                                                : analysis.white}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {analysis.date}
                                        </span>
                                    </div>

                                    {/* Navigation Controls */}
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 border-white/10"
                                            onClick={() => setCurrentMoveIndex(-1)}
                                            disabled={currentMoveIndex === -1}
                                        >
                                            <ChevronsLeft className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 border-white/10"
                                            onClick={() =>
                                                setCurrentMoveIndex(Math.max(-1, currentMoveIndex - 1))
                                            }
                                            disabled={currentMoveIndex === -1}
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                        </Button>
                                        <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                                            {currentMoveIndex >= 0
                                                ? `${analysis.moves[currentMoveIndex].move_number}. ${analysis.moves[currentMoveIndex].san}`
                                                : "Start"}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 border-white/10"
                                            onClick={() =>
                                                setCurrentMoveIndex(
                                                    Math.min(
                                                        analysis.moves.length - 1,
                                                        currentMoveIndex + 1
                                                    )
                                                )
                                            }
                                            disabled={
                                                currentMoveIndex === analysis.moves.length - 1
                                            }
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 border-white/10"
                                            onClick={() =>
                                                setCurrentMoveIndex(analysis.moves.length - 1)
                                            }
                                            disabled={
                                                currentMoveIndex === analysis.moves.length - 1
                                            }
                                        >
                                            <ChevronsRight className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground/50">
                                        Use ← → arrow keys to navigate
                                    </p>

                                    {/* Key Moments Timeline */}
                                    {analysis.key_moments && analysis.key_moments.length > 0 && (
                                        <div className="w-full mt-3">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <Zap className="w-3 h-3 text-amber-400" />
                                                <span className="text-[10px] font-medium text-amber-400/80">KEY MOMENTS</span>
                                            </div>
                                            <TooltipProvider delayDuration={200}>
                                                <div className="relative w-full h-6 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                    {/* Progress bar showing current position */}
                                                    <div
                                                        className="absolute inset-y-0 left-0 bg-white/[0.03] transition-all duration-150"
                                                        style={{
                                                            width: `${analysis.moves.length > 0 ? ((currentMoveIndex + 1) / analysis.moves.length) * 100 : 0}%`
                                                        }}
                                                    />
                                                    {/* Moment dots */}
                                                    {analysis.key_moments.map((moment, i) => {
                                                        const position = (moment.move_index / Math.max(1, analysis.moves.length - 1)) * 100;
                                                        const dotColor = moment.severity === "critical"
                                                            ? "bg-red-500 shadow-red-500/50"
                                                            : moment.severity === "major"
                                                                ? "bg-orange-400 shadow-orange-400/50"
                                                                : moment.classification === "Brilliant"
                                                                    ? "bg-cyan-400 shadow-cyan-400/50"
                                                                    : "bg-yellow-400 shadow-yellow-400/50";
                                                        const isActive = currentMoveIndex === moment.move_index;
                                                        return (
                                                            <Tooltip key={i}>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        className={`absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-150 ${dotColor} ${isActive ? "w-3.5 h-3.5 shadow-lg ring-2 ring-white/30" : "w-2.5 h-2.5 shadow-md hover:scale-150"}`}
                                                                        style={{ left: `${position}%`, transform: `translateX(-50%) translateY(-50%)` }}
                                                                        onClick={() => setCurrentMoveIndex(moment.move_index)}
                                                                    />
                                                                </TooltipTrigger>
                                                                <TooltipContent side="bottom" className="max-w-[250px] text-xs">
                                                                    <p>{moment.description}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        );
                                                    })}
                                                </div>
                                            </TooltipProvider>
                                        </div>
                                    )}


                                    {/* AI Coach Dialog */}
                                    <Dialog open={coachDialogOpen} onOpenChange={setCoachDialogOpen}>
                                        <DialogContent className="sm:max-w-md bg-slate-900/95 border-indigo-500/20 backdrop-blur-xl">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2 text-indigo-400">
                                                    <MessageCircle className="w-4 h-4" />
                                                    AI Coach
                                                    {analysis.moves[currentMoveIndex] && (
                                                        <span className="text-xs font-normal text-white/50 ml-1">
                                                            — {analysis.moves[currentMoveIndex].move_number}.
                                                            {analysis.moves[currentMoveIndex].color === "black" ? ".." : ""}{" "}
                                                            {analysis.moves[currentMoveIndex].san}
                                                        </span>
                                                    )}
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="text-sm leading-relaxed text-white/85 whitespace-pre-wrap break-words">
                                                {coachComment}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {/* Compact Move Sheet + Summary */}
                                <div className="flex-1 min-w-0 space-y-3">
                                    {/* Opening */}
                                    {analysis.summary.opening_name && (
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                            <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                            <span className="text-xs text-amber-200/80 truncate">
                                                {analysis.summary.opening_name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Move Sheet */}
                                    <Card className="bg-card/50 backdrop-blur border-white/5">
                                        <CardContent className="p-0">
                                            <ScrollArea className="h-[420px]">
                                                <div className="p-2">
                                                    <table className="w-full text-xs">
                                                        <tbody>
                                                            {movePairs.map((pair) => (
                                                                <tr key={pair.number} className="group">
                                                                    {/* Move number */}
                                                                    <td className="text-muted-foreground/50 text-right pr-1.5 py-[2px] w-6 tabular-nums">
                                                                        {pair.number}
                                                                    </td>

                                                                    {/* White move */}
                                                                    <td className="py-[2px] w-1/2">
                                                                        {pair.white && (
                                                                            <button
                                                                                onClick={() =>
                                                                                    setCurrentMoveIndex(pair.whiteIdx)
                                                                                }
                                                                                className={`w-full text-left flex items-center gap-1 px-1.5 py-1 rounded transition-all ${currentMoveIndex === pair.whiteIdx
                                                                                    ? "bg-indigo-500/15 ring-1 ring-indigo-500/30"
                                                                                    : "hover:bg-white/5"
                                                                                    }`}
                                                                            >
                                                                                <span className="font-mono font-medium">
                                                                                    {pair.white.san}
                                                                                </span>
                                                                                {classificationConfig[
                                                                                    pair.white.classification
                                                                                ] && (
                                                                                        <span
                                                                                            className={`flex items-center ${classificationConfig[pair.white.classification].color}`}
                                                                                        >
                                                                                            {
                                                                                                classificationConfig[
                                                                                                    pair.white.classification
                                                                                                ].icon
                                                                                            }
                                                                                        </span>
                                                                                    )}
                                                                            </button>
                                                                        )}
                                                                    </td>

                                                                    {/* Black move */}
                                                                    <td className="py-[2px] w-1/2">
                                                                        {pair.black && (
                                                                            <button
                                                                                onClick={() =>
                                                                                    setCurrentMoveIndex(pair.blackIdx)
                                                                                }
                                                                                className={`w-full text-left flex items-center gap-1 px-1.5 py-1 rounded transition-all ${currentMoveIndex === pair.blackIdx
                                                                                    ? "bg-indigo-500/15 ring-1 ring-indigo-500/30"
                                                                                    : "hover:bg-white/5"
                                                                                    }`}
                                                                            >
                                                                                <span className="font-mono font-medium">
                                                                                    {pair.black.san}
                                                                                </span>
                                                                                {classificationConfig[
                                                                                    pair.black.classification
                                                                                ] && (
                                                                                        <span
                                                                                            className={`flex items-center ${classificationConfig[pair.black.classification].color}`}
                                                                                        >
                                                                                            {
                                                                                                classificationConfig[
                                                                                                    pair.black.classification
                                                                                                ].icon
                                                                                            }
                                                                                        </span>
                                                                                    )}
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>

                                    {/* Summary Stats */}
                                    <Card className="bg-card/50 backdrop-blur border-white/5">
                                        <CardContent className="p-3">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-muted-foreground w-14">
                                                        Accuracy
                                                    </span>
                                                    <Progress
                                                        value={analysis.summary.accuracy}
                                                        className="flex-1 h-1.5"
                                                    />
                                                    <span className="text-xs font-bold text-amber-400 w-10 text-right">
                                                        {analysis.summary.accuracy.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {[
                                                        {
                                                            label: "💎",
                                                            count: analysis.summary.brilliancies,
                                                            color: "text-cyan-300",
                                                        },
                                                        {
                                                            label: "⭐",
                                                            count: analysis.summary.great_moves,
                                                            color: "text-blue-400",
                                                        },
                                                        {
                                                            label: "✅",
                                                            count: analysis.summary.best_moves,
                                                            color: "text-emerald-400",
                                                        },
                                                        {
                                                            label: "👍",
                                                            count: analysis.summary.good_moves,
                                                            color: "text-lime-400",
                                                        },
                                                        {
                                                            label: "⚠️",
                                                            count: analysis.summary.inaccuracies,
                                                            color: "text-yellow-400",
                                                        },
                                                        {
                                                            label: "❌",
                                                            count: analysis.summary.mistakes,
                                                            color: "text-orange-400",
                                                        },
                                                        {
                                                            label: "💀",
                                                            count: analysis.summary.blunders,
                                                            color: "text-red-400",
                                                        },
                                                    ].map((item) => (
                                                        <div key={item.label} className="text-center">
                                                            <span className="text-xs">{item.label}</span>
                                                            <p
                                                                className={`text-sm font-bold ${item.color}`}
                                                            >
                                                                {item.count}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}

                    {!analysis && !analyzingGame && (
                        <Card className="bg-card/50 backdrop-blur border-white/5">
                            <CardContent className="flex items-center justify-center py-32">
                                <div className="text-center space-y-3">
                                    <Target className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                                    <div>
                                        <p className="text-muted-foreground text-sm">
                                            Select a game to analyze
                                        </p>
                                        <p className="text-muted-foreground/50 text-xs mt-1">
                                            Games are saved locally — sync to get new ones
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
