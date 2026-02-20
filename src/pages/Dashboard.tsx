import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChessBoard } from "@/components/ChessBoard";
import {
    Search,
    Crown,
    Zap,
    Timer,
    Clock,
    TrendingUp,
    Trophy,
    User,
    Activity,
    Loader2,
} from "lucide-react";
import {
    fetchProfile,
    fetchStats,
    type ChessComProfile,
    type ChessComStats,
} from "@/lib/api";

export function Dashboard() {
    const [username, setUsername] = useState("");
    const [savedUsername, setSavedUsername] = useState<string | null>(
        localStorage.getItem("chess_username")
    );
    const [profile, setProfile] = useState<ChessComProfile | null>(null);
    const [stats, setStats] = useState<ChessComStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (savedUsername) {
            loadProfile(savedUsername);
        }
    }, []);

    async function loadProfile(name: string) {
        setLoading(true);
        setError(null);
        try {
            const [p, s] = await Promise.all([fetchProfile(name), fetchStats(name)]);
            setProfile(p);
            setStats(s);
            localStorage.setItem("chess_username", name);
            setSavedUsername(name);
        } catch (e) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (username.trim()) {
            loadProfile(username.trim());
        }
    }

    function getRatingColor(rating?: number): string {
        if (!rating) return "text-muted-foreground";
        if (rating >= 2200) return "text-amber-400";
        if (rating >= 1800) return "text-violet-400";
        if (rating >= 1400) return "text-cyan-400";
        if (rating >= 1000) return "text-emerald-400";
        return "text-foreground";
    }

    function formatDate(timestamp?: number): string {
        if (!timestamp) return "N/A";
        return new Date(timestamp * 1000).toLocaleDateString("el-GR", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 border border-white/5">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2Mmh2MmgtMnYyaC0ydi0ySDMydi0yaDJ2LTJ6bTEwLTExLjkxNEwyMi41ODYgMCA0MC45MTQgMTguMzI4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Crown className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Chess Coach
                            </h1>
                            <p className="text-sm text-indigo-200/60">
                                Your personal chess improvement companion
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="flex gap-3 max-w-md mt-6"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Enter Chess.com username..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-amber-500/50"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 border-0"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Connect"
                            )}
                        </Button>
                    </form>
                </div>
            </div>

            {error && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="pt-6">
                        <p className="text-destructive text-sm">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Profile & Stats */}
            {profile && stats && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <Card className="lg:col-span-1 bg-card/50 backdrop-blur border-white/5">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10">
                                    {profile.avatar ? (
                                        <img
                                            src={profile.avatar}
                                            alt={profile.username || ""}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-8 h-8 text-white" />
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {profile.title && (
                                            <Badge
                                                variant="outline"
                                                className="text-amber-400 border-amber-400/30 bg-amber-400/10"
                                            >
                                                {profile.title}
                                            </Badge>
                                        )}
                                        {profile.username}
                                    </CardTitle>
                                    <CardDescription>
                                        {profile.name || "Chess.com Player"}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Activity className="w-4 h-4" />
                                <span>Last online: {formatDate(profile.last_online)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Trophy className="w-4 h-4" />
                                <span>Joined: {formatDate(profile.joined)}</span>
                            </div>
                            {profile.followers !== undefined && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="w-4 h-4" />
                                    <span>{profile.followers} followers</span>
                                </div>
                            )}

                            <div className="pt-4">
                                <ChessBoard size={260} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ratings Grid */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Rapid */}
                        <Card className="bg-card/50 backdrop-blur border-white/5 hover:border-cyan-500/20 transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                            <Timer className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <CardTitle className="text-base">Rapid</CardTitle>
                                    </div>
                                    <span
                                        className={`text-2xl font-bold ${getRatingColor(stats.chess_rapid?.last?.rating)}`}
                                    >
                                        {stats.chess_rapid?.last?.rating || "—"}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Best: {stats.chess_rapid?.best?.rating || "—"}
                                    </span>
                                    <div className="flex gap-3">
                                        <span className="text-emerald-400">
                                            W: {stats.chess_rapid?.record?.win || 0}
                                        </span>
                                        <span className="text-red-400">
                                            L: {stats.chess_rapid?.record?.loss || 0}
                                        </span>
                                        <span className="text-muted-foreground">
                                            D: {stats.chess_rapid?.record?.draw || 0}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Blitz */}
                        <Card className="bg-card/50 backdrop-blur border-white/5 hover:border-amber-500/20 transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <CardTitle className="text-base">Blitz</CardTitle>
                                    </div>
                                    <span
                                        className={`text-2xl font-bold ${getRatingColor(stats.chess_blitz?.last?.rating)}`}
                                    >
                                        {stats.chess_blitz?.last?.rating || "—"}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Best: {stats.chess_blitz?.best?.rating || "—"}
                                    </span>
                                    <div className="flex gap-3">
                                        <span className="text-emerald-400">
                                            W: {stats.chess_blitz?.record?.win || 0}
                                        </span>
                                        <span className="text-red-400">
                                            L: {stats.chess_blitz?.record?.loss || 0}
                                        </span>
                                        <span className="text-muted-foreground">
                                            D: {stats.chess_blitz?.record?.draw || 0}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bullet */}
                        <Card className="bg-card/50 backdrop-blur border-white/5 hover:border-red-500/20 transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-red-400" />
                                        </div>
                                        <CardTitle className="text-base">Bullet</CardTitle>
                                    </div>
                                    <span
                                        className={`text-2xl font-bold ${getRatingColor(stats.chess_bullet?.last?.rating)}`}
                                    >
                                        {stats.chess_bullet?.last?.rating || "—"}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Best: {stats.chess_bullet?.best?.rating || "—"}
                                    </span>
                                    <div className="flex gap-3">
                                        <span className="text-emerald-400">
                                            W: {stats.chess_bullet?.record?.win || 0}
                                        </span>
                                        <span className="text-red-400">
                                            L: {stats.chess_bullet?.record?.loss || 0}
                                        </span>
                                        <span className="text-muted-foreground">
                                            D: {stats.chess_bullet?.record?.draw || 0}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Daily */}
                        <Card className="bg-card/50 backdrop-blur border-white/5 hover:border-violet-500/20 transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 text-violet-400" />
                                        </div>
                                        <CardTitle className="text-base">Daily</CardTitle>
                                    </div>
                                    <span
                                        className={`text-2xl font-bold ${getRatingColor(stats.chess_daily?.last?.rating)}`}
                                    >
                                        {stats.chess_daily?.last?.rating || "—"}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Best: {stats.chess_daily?.best?.rating || "—"}
                                    </span>
                                    <div className="flex gap-3">
                                        <span className="text-emerald-400">
                                            W: {stats.chess_daily?.record?.win || 0}
                                        </span>
                                        <span className="text-red-400">
                                            L: {stats.chess_daily?.record?.loss || 0}
                                        </span>
                                        <span className="text-muted-foreground">
                                            D: {stats.chess_daily?.record?.draw || 0}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tactics & Puzzle Rush */}
                        {(stats.tactics || stats.puzzle_rush) && (
                            <Card className="sm:col-span-2 bg-card/50 backdrop-blur border-white/5">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-amber-400" />
                                        Puzzles & Tactics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-8">
                                        {stats.tactics?.highest && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Tactics Rating
                                                </p>
                                                <p className="text-xl font-bold text-amber-400">
                                                    {stats.tactics.highest.rating || "—"}
                                                </p>
                                            </div>
                                        )}
                                        {stats.puzzle_rush?.best && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Puzzle Rush Best
                                                </p>
                                                <p className="text-xl font-bold text-emerald-400">
                                                    {stats.puzzle_rush.best.score || "—"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Welcome state */}
            {!profile && !loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-card/50 backdrop-blur border-white/5 hover:border-cyan-500/20 transition-all duration-300 group">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6 text-cyan-400" />
                            </div>
                            <CardTitle>Game Analysis</CardTitle>
                            <CardDescription>
                                Import games from Chess.com and get detailed move-by-move analysis
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-card/50 backdrop-blur border-white/5 hover:border-amber-500/20 transition-all duration-300 group">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Crown className="w-6 h-6 text-amber-400" />
                            </div>
                            <CardTitle>Opening Explorer</CardTitle>
                            <CardDescription>
                                Study 20+ openings and defenses with key ideas and variations
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-card/50 backdrop-blur border-white/5 hover:border-violet-500/20 transition-all duration-300 group">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-violet-400" />
                            </div>
                            <CardTitle>Lessons</CardTitle>
                            <CardDescription>
                                Structured lessons for middlegame, endgame, tactics and strategy
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}
        </div>
    );
}
