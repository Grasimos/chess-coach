import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChessBoard } from "@/components/ChessBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BookOpen,
    Lightbulb,
    ChevronRight,
    Swords,
    Shield,
    Compass,
    Loader2,
} from "lucide-react";
import { getOpenings, type Opening } from "@/lib/api";

const categoryInfo: Record<string, { label: string; icon: React.ReactNode; color: string; value: string }> = {
    KingPawn: { label: "King's Pawn (e4)", icon: <Swords className="w-4 h-4" />, color: "text-red-400", value: "king_pawn" },
    QueenPawn: { label: "Queen's Pawn (d4)", icon: <Shield className="w-4 h-4" />, color: "text-blue-400", value: "queen_pawn" },
    SemiOpen: { label: "Semi-Open", icon: <Compass className="w-4 h-4" />, color: "text-amber-400", value: "semi_open" },
    Indian: { label: "Indian Systems", icon: <BookOpen className="w-4 h-4" />, color: "text-emerald-400", value: "indian" },
    Flank: { label: "Flank Openings", icon: <ChevronRight className="w-4 h-4" />, color: "text-violet-400", value: "flank" },
};

export function OpeningExplorer() {
    const [openings, setOpenings] = useState<Opening[]>([]);
    const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

    useEffect(() => {
        loadOpenings();
    }, [activeCategory]);

    async function loadOpenings() {
        setLoading(true);
        try {
            const category = activeCategory === "all" ? undefined : activeCategory;
            const o = await getOpenings(category);
            setOpenings(o);
        } catch {
            // Fallback - shouldn't fail since it's local
        } finally {
            setLoading(false);
        }
    }

    function selectOpening(opening: Opening) {
        setSelectedOpening(opening);
        setCurrentMoveIndex(-1);
    }

    function buildFenFromMoves(_moves: string[], _upToIndex: number): string {
        // Simple starting position for display; in production we'd compute real FEN
        return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    }

    function getCategoryColor(cat: string): string {
        const info = categoryInfo[cat];
        return info?.color || "text-foreground";
    }

    function getCategoryLabel(cat: string): string {
        const info = categoryInfo[cat];
        return info?.label || cat;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Opening Explorer</h2>
                <p className="text-muted-foreground">
                    Study chess openings, defenses, and their key ideas
                </p>
            </div>

            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white/10">
                        All
                    </TabsTrigger>
                    {Object.entries(categoryInfo).map(([key, info]) => (
                        <TabsTrigger
                            key={key}
                            value={info.value}
                            className="data-[state=active]:bg-white/10 gap-1.5"
                        >
                            {info.icon}
                            <span className="hidden sm:inline">{info.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={activeCategory} className="mt-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Openings List */}
                            <div className="lg:col-span-5">
                                <Card className="bg-card/50 backdrop-blur border-white/5">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-amber-400" />
                                            Openings ({openings.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ScrollArea className="h-[600px]">
                                            <div className="p-3 space-y-1">
                                                {openings.map((opening, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => selectOpening(opening)}
                                                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${selectedOpening?.eco === opening.eco
                                                            ? "bg-indigo-500/10 border border-indigo-500/30"
                                                            : "hover:bg-white/5 border border-transparent"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-medium text-sm">{opening.name}</span>
                                                            <Badge variant="outline" className="text-[10px] px-1.5 border-white/10">
                                                                {opening.eco}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                className={`text-[10px] px-1.5 py-0 border-0 bg-white/5 ${getCategoryColor(opening.category)}`}
                                                            >
                                                                {getCategoryLabel(opening.category)}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground font-mono">
                                                                {opening.pgn}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Opening Detail */}
                            <div className="lg:col-span-7">
                                {selectedOpening ? (
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <Card className="bg-card/50 backdrop-blur border-white/5">
                                            <CardHeader>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                                                        <BookOpen className="w-5 h-5 text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            {selectedOpening.name}
                                                            <Badge variant="outline" className="text-xs border-white/10">
                                                                {selectedOpening.eco}
                                                            </Badge>
                                                        </CardTitle>
                                                        <CardDescription>
                                                            <Badge className={`text-xs border-0 bg-white/5 ${getCategoryColor(selectedOpening.category)}`}>
                                                                {getCategoryLabel(selectedOpening.category)}
                                                            </Badge>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </Card>

                                        {/* Board & Info */}
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                            <Card className="bg-card/50 backdrop-blur border-white/5">
                                                <CardContent className="p-4 flex flex-col items-center gap-3">
                                                    <ChessBoard
                                                        fen={buildFenFromMoves(
                                                            selectedOpening.moves,
                                                            currentMoveIndex
                                                        )}
                                                        size={340}
                                                    />
                                                    {/* Move sequence */}
                                                    <div className="flex flex-wrap gap-1 justify-center">
                                                        <Button
                                                            variant={currentMoveIndex === -1 ? "default" : "outline"}
                                                            size="sm"
                                                            className="text-xs h-7 border-white/10"
                                                            onClick={() => setCurrentMoveIndex(-1)}
                                                        >
                                                            Start
                                                        </Button>
                                                        {selectedOpening.moves.map((move, i) => (
                                                            <Button
                                                                key={i}
                                                                variant={currentMoveIndex === i ? "default" : "outline"}
                                                                size="sm"
                                                                className="text-xs h-7 font-mono border-white/10"
                                                                onClick={() => setCurrentMoveIndex(i)}
                                                            >
                                                                {i % 2 === 0 ? `${Math.floor(i / 2) + 1}.` : ""}
                                                                {move}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <div className="space-y-4">
                                                {/* Description */}
                                                <Card className="bg-card/50 backdrop-blur border-white/5">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm">Description</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            {selectedOpening.description}
                                                        </p>
                                                    </CardContent>
                                                </Card>

                                                {/* Key Ideas */}
                                                <Card className="bg-card/50 backdrop-blur border-white/5">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm flex items-center gap-2">
                                                            <Lightbulb className="w-4 h-4 text-amber-400" />
                                                            Key Ideas
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <ul className="space-y-2">
                                                            {selectedOpening.key_ideas.map((idea, i) => (
                                                                <li
                                                                    key={i}
                                                                    className="flex items-start gap-2 text-sm text-muted-foreground"
                                                                >
                                                                    <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                                                    {idea}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </CardContent>
                                                </Card>

                                                {/* PGN */}
                                                <Card className="bg-card/50 backdrop-blur border-white/5">
                                                    <CardContent className="py-3 px-4">
                                                        <p className="text-xs text-muted-foreground mb-1">Moves</p>
                                                        <p className="font-mono text-sm">{selectedOpening.pgn}</p>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Card className="bg-card/50 backdrop-blur border-white/5">
                                        <CardContent className="flex items-center justify-center py-20">
                                            <div className="text-center space-y-2">
                                                <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                                                <p className="text-muted-foreground">
                                                    Select an opening to explore
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
