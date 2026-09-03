import { Globe, Store, User, Plus, CircleCheck, Clock, Pencil, Trash2, ArchiveRestore, TrendingUp, TrendingDown } from "lucide-react";
import type { Activity } from "@/types";

export const SCOPE_ICON = { GLOBAL: Globe, STORE: Store, OWNER: User } as const;

export const EVENT_ICON: Record<string, any> = {
    created: Plus,
    completed: CircleCheck,
    pending: Clock,
    updated: Pencil,
    deleted: Trash2,
    recovered: ArchiveRestore,
};

export const EVENT_COLOR: Record<string, string> = {
    created: "text-blue-500 bg-blue-500/10",
    completed: "text-green-500 bg-green-500/10",
    pending: "text-yellow-500 bg-yellow-500/10",
    updated: "text-muted-foreground bg-muted",
    deleted: "text-red-500 bg-red-500/10",
    recovered: "text-purple-500 bg-purple-500/10",
};

const SUBJECT_LABEL: Record<string, string> = {
    Design: "idea",
    Store: "store",
    Owner: "owner",
};

export function getActivityTitle(a: Activity): string {
    const subjectLabel = SUBJECT_LABEL[a.subjectType] ?? a.subjectType.toLowerCase();
    const capitalized = subjectLabel.charAt(0).toUpperCase() + subjectLabel.slice(1);
    switch (a.event) {
        case "created": return `New ${subjectLabel} added`;
        case "completed": return `${capitalized} completed`;
        case "pending": return `${capitalized} marked as pending`;
        case "updated": return `${capitalized} updated`;
        case "deleted": return `${capitalized} deleted`;
        case "recovered": return `${capitalized} restored`;
        default: return a.event;
    }
}

export function getActivityDescription(a: Activity) {
    const name = a.properties?.itemName ?? "Untitled";
    const subjectLabel = SUBJECT_LABEL[a.subjectType] ?? a.subjectType.toLowerCase();
    const bold = <span className="font-semibold text-foreground">{name}</span>;
    switch (a.event) {
        case "created": return <>You added a new {subjectLabel} called {bold}.</>;
        case "completed": return <>You marked {bold} as complete.</>;
        case "pending": return <>You moved {bold} back to pending.</>;
        case "updated": return <>You updated the {subjectLabel} {bold}.</>;
        case "deleted": return <>You deleted the {subjectLabel} {bold}.</>;
        case "recovered": return <>You restored the {subjectLabel} {bold} from the trash.</>;
        default: return a.description;
    }
}

export function timeAgo(dateStr: string): string {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ChangeBadge({ pct }: { pct: number | null }) {
    if (pct === null) return <span className="text-xs text-muted-foreground">New</span>;
    const isUp = pct >= 0;
    const Icon = isUp ? TrendingUp : TrendingDown;
    return (
        <span className={`flex items-center gap-1 text-xs ${isUp ? "text-green-500" : "text-red-500"}`}>
            <Icon className="h-4 w-4" />
            {isUp ? "+" : ""}{pct}%
        </span>
    );
}
export const EVENT_DOT_COLOR: Record<string, string> = {
    created: "bg-blue-500",
    completed: "bg-green-500",
    pending: "bg-yellow-500",
    updated: "bg-muted-foreground",
    deleted: "bg-red-500",
    recovered: "bg-purple-500",
};
export function CircularProgress({ percent, size = "md" }: { percent: number; size?: "sm" | "md" }) {
    const radius = size === "sm" ? 16 : 34;
    const box = size === "sm" ? 40 : 80;
    const strokeWidth = size === "sm" ? 4 : 6;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    const dim = size === "sm" ? "h-10 w-10" : "h-20 w-20";

    return (
        <div className={`relative ${dim} shrink-0`}>
            <svg viewBox={`0 0 ${box} ${box}`} className={`${dim} -rotate-90`}>
                <circle cx={box / 2} cy={box / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={strokeWidth} />
                <circle
                    cx={box / 2} cy={box / 2} r={radius} fill="none"
                    stroke="var(--chart-2)" strokeWidth={strokeWidth} strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center font-bold ${size === "sm" ? "text-[9px]" : "text-base"}`}>
                {percent}%
            </span>
        </div>
    );
}