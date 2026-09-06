import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreateStoreDialog } from "@/components/create-store-dialog";
import { CreateOwnerDialog } from "@/components/create-owner-dialog";
import { Palette, Store as StoreIcon, UserPlus, Link2, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Owner, Store } from "@/types";
import { CreateDailyGoalDialog } from "@/components/create-daily-goal-dialog";
import { CreateGoalDialog } from "@/components/create-goal-dialog";
import { Clock, Target } from "lucide-react";

function ActionTile({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-chart-2/10 text-chart-2">
                <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
}

export function QuickActionsCard({ stores, owners, existingDailyGoals, onCreated }: { stores: Store[]; owners: Owner[]; existingDailyGoals: any[]; onCreated: () => void }) {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    function handleCopyMonitorLink() {
        const url = `${window.location.origin}/monitor/${user?.monitorToken}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <Card className="h-fit">
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    <Link to="/designs">
                        <ActionTile icon={Palette} label="Add Design" />
                    </Link>

                    <CreateStoreDialog
                        stores={stores}
                        owners={owners}
                        onCreated={onCreated}
                        trigger={<ActionTile icon={StoreIcon} label="Add New Store" />}
                    />

                    <CreateOwnerDialog
                        owners={owners}
                        onCreated={onCreated}
                        trigger={<ActionTile icon={UserPlus} label="Add New Owner" />}
                    />

                    <CreateDailyGoalDialog
                        stores={stores}
                        owners={owners}
                        existingDailyGoals={existingDailyGoals}
                        onCreated={onCreated}
                        trigger={<ActionTile icon={Clock} label="Add Daily Goal" />}
                    />

                    <CreateGoalDialog
                        stores={stores}
                        owners={owners}
                        onCreated={onCreated}
                        trigger={<ActionTile icon={Target} label="Add Campaign" />}
                    />

                    <div onClick={handleCopyMonitorLink}>
                        <ActionTile icon={copied ? Check : Link2} label={copied ? "Copied!" : "Copy Monitor Link"} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}