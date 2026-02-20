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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ChessBoard } from "@/components/ChessBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    GraduationCap,
    BookOpen,
    Swords,
    Target,
    Brain,
    Compass,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Loader2,
    Sparkles,
} from "lucide-react";
import { getLessons, type Lesson } from "@/lib/api";

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string; gradient: string; value: string }> = {
    Opening: { label: "Openings", icon: <BookOpen className="w-4 h-4" />, color: "text-amber-400", gradient: "from-amber-500/20 to-orange-500/20", value: "opening" },
    Middlegame: { label: "Middlegame", icon: <Swords className="w-4 h-4" />, color: "text-blue-400", gradient: "from-blue-500/20 to-indigo-500/20", value: "middlegame" },
    Endgame: { label: "Endgame", icon: <Target className="w-4 h-4" />, color: "text-emerald-400", gradient: "from-emerald-500/20 to-teal-500/20", value: "endgame" },
    Tactics: { label: "Tactics", icon: <Sparkles className="w-4 h-4" />, color: "text-red-400", gradient: "from-red-500/20 to-pink-500/20", value: "tactics" },
    Strategy: { label: "Strategy", icon: <Brain className="w-4 h-4" />, color: "text-violet-400", gradient: "from-violet-500/20 to-purple-500/20", value: "strategy" },
    Positional: { label: "Positional", icon: <Compass className="w-4 h-4" />, color: "text-cyan-400", gradient: "from-cyan-500/20 to-sky-500/20", value: "positional" },
};

const difficultyColors: Record<string, string> = {
    Beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Advanced: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    Expert: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function Lessons() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [activeCategory, setActiveCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
        const saved = localStorage.getItem("completed_lessons");
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    useEffect(() => {
        loadLessons();
    }, [activeCategory]);

    async function loadLessons() {
        setLoading(true);
        try {
            const category = activeCategory === "all" ? undefined : activeCategory;
            const l = await getLessons(category);
            setLessons(l);
        } catch {
            // Local data, shouldn't fail
        } finally {
            setLoading(false);
        }
    }

    function selectLesson(lesson: Lesson) {
        setSelectedLesson(lesson);
        setCurrentSection(0);
    }

    function markComplete(lessonId: string) {
        const newCompleted = new Set(completedLessons);
        newCompleted.add(lessonId);
        setCompletedLessons(newCompleted);
        localStorage.setItem(
            "completed_lessons",
            JSON.stringify([...newCompleted])
        );
    }

    function getProgress(): number {
        if (lessons.length === 0) return 0;
        return (completedLessons.size / lessons.length) * 100;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Lessons</h2>
                    <p className="text-muted-foreground">
                        Structured learning for every phase of the game
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <p className="text-sm font-bold text-amber-400">
                            {completedLessons.size}/{lessons.length} completed
                        </p>
                    </div>
                    <div className="w-32">
                        <Progress value={getProgress()} className="h-2" />
                    </div>
                </div>
            </div>

            {/* Category Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(categoryConfig).map(([key, config]) => {
                    const count = lessons.filter((l) => l.category === key).length;
                    const completed = lessons.filter(
                        (l) => l.category === key && completedLessons.has(l.id)
                    ).length;
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(config.value)}
                            className={`p-3 rounded-xl border transition-all duration-200 text-left ${activeCategory === config.value
                                    ? "bg-white/5 border-white/20"
                                    : "bg-card/30 border-white/5 hover:bg-white/5"
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-2`}
                            >
                                <span className={config.color}>{config.icon}</span>
                            </div>
                            <p className="text-sm font-medium">{config.label}</p>
                            <p className="text-xs text-muted-foreground">
                                {completed}/{count} done
                            </p>
                        </button>
                    );
                })}
            </div>

            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white/10">
                        All Lessons
                    </TabsTrigger>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                        <TabsTrigger
                            key={key}
                            value={config.value}
                            className="data-[state=active]:bg-white/10 gap-1.5"
                        >
                            {config.icon}
                            <span className="hidden md:inline">{config.label}</span>
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
                            {/* Lessons List */}
                            <div className="lg:col-span-4">
                                <Card className="bg-card/50 backdrop-blur border-white/5">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-amber-400" />
                                            Available Lessons
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ScrollArea className="h-[550px]">
                                            <div className="p-3 space-y-1">
                                                {lessons.map((lesson) => {
                                                    const config = categoryConfig[lesson.category];
                                                    const isCompleted = completedLessons.has(lesson.id);
                                                    return (
                                                        <button
                                                            key={lesson.id}
                                                            onClick={() => selectLesson(lesson)}
                                                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${selectedLesson?.id === lesson.id
                                                                    ? "bg-indigo-500/10 border border-indigo-500/30"
                                                                    : "hover:bg-white/5 border border-transparent"
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-medium text-sm flex items-center gap-2">
                                                                    {isCompleted && (
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                                    )}
                                                                    {lesson.title}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {config && (
                                                                    <Badge className={`text-[10px] px-1.5 py-0 border-0 bg-white/5 ${config.color}`}>
                                                                        {config.label}
                                                                    </Badge>
                                                                )}
                                                                <Badge className={`text-[10px] px-1.5 py-0 ${difficultyColors[lesson.difficulty] || ""}`}>
                                                                    {lesson.difficulty}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                {lesson.description}
                                                            </p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Lesson Content */}
                            <div className="lg:col-span-8">
                                {selectedLesson ? (
                                    <div className="space-y-4">
                                        {/* Lesson Header */}
                                        <Card className="bg-card/50 backdrop-blur border-white/5">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categoryConfig[selectedLesson.category]?.gradient || "from-slate-500/20 to-slate-600/20"
                                                                } flex items-center justify-center`}
                                                        >
                                                            <span className={categoryConfig[selectedLesson.category]?.color || ""}>
                                                                {categoryConfig[selectedLesson.category]?.icon}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <CardTitle>{selectedLesson.title}</CardTitle>
                                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                                <Badge className={`text-xs ${difficultyColors[selectedLesson.difficulty] || ""}`}>
                                                                    {selectedLesson.difficulty}
                                                                </Badge>
                                                                <span>
                                                                    {currentSection + 1}/{selectedLesson.content.length} sections
                                                                </span>
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    {!completedLessons.has(selectedLesson.id) && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => markComplete(selectedLesson.id)}
                                                            className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 text-white"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                                            Mark Complete
                                                        </Button>
                                                    )}
                                                    {completedLessons.has(selectedLesson.id) && (
                                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                            Completed
                                                        </Badge>
                                                    )}
                                                </div>
                                                {/* Section Progress */}
                                                <div className="flex gap-1 mt-4">
                                                    {selectedLesson.content.map((_, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setCurrentSection(i)}
                                                            className={`h-1.5 flex-1 rounded-full transition-colors ${i === currentSection
                                                                    ? "bg-amber-400"
                                                                    : i < currentSection
                                                                        ? "bg-amber-400/30"
                                                                        : "bg-white/10"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </CardHeader>
                                        </Card>

                                        {/* Section Content */}
                                        {selectedLesson.content[currentSection] && (
                                            <Card className="bg-card/50 backdrop-blur border-white/5">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">
                                                        {selectedLesson.content[currentSection].title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    <p className="text-muted-foreground leading-relaxed">
                                                        {selectedLesson.content[currentSection].content}
                                                    </p>

                                                    {selectedLesson.content[currentSection].fen && (
                                                        <div className="flex justify-center">
                                                            <ChessBoard
                                                                fen={selectedLesson.content[currentSection].fen!}
                                                                size={360}
                                                            />
                                                        </div>
                                                    )}

                                                    {selectedLesson.content[currentSection].moves && (
                                                        <div className="bg-white/5 rounded-lg p-3">
                                                            <p className="text-xs text-muted-foreground mb-2">Key Moves:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {selectedLesson.content[currentSection].moves!.map((move, i) => (
                                                                    <Badge
                                                                        key={i}
                                                                        variant="outline"
                                                                        className="font-mono border-white/10"
                                                                    >
                                                                        {move}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <Separator className="bg-white/5" />

                                                    {/* Navigation */}
                                                    <div className="flex items-center justify-between">
                                                        <Button
                                                            variant="outline"
                                                            disabled={currentSection === 0}
                                                            onClick={() => setCurrentSection(currentSection - 1)}
                                                            className="border-white/10"
                                                        >
                                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                                            Previous
                                                        </Button>
                                                        <span className="text-sm text-muted-foreground">
                                                            Section {currentSection + 1} of{" "}
                                                            {selectedLesson.content.length}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            disabled={currentSection === selectedLesson.content.length - 1}
                                                            onClick={() => setCurrentSection(currentSection + 1)}
                                                            className="border-white/10"
                                                        >
                                                            Next
                                                            <ChevronRight className="w-4 h-4 ml-1" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                ) : (
                                    <Card className="bg-card/50 backdrop-blur border-white/5">
                                        <CardContent className="flex items-center justify-center py-20">
                                            <div className="text-center space-y-2">
                                                <GraduationCap className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                                                <p className="text-muted-foreground">
                                                    Select a lesson to start learning
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
