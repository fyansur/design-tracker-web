import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreateStoreDialog } from "@/components/create-store-dialog";
import { CreateOwnerDialog } from "@/components/create-owner-dialog";
import { Palette, Store as StoreIcon, UserPlus, Link2, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Owner, Store } from "@/types";

function ActionTile({ icon: Icon, label, children }: { icon: any; label: string; children?: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border p-4 cursor-pointer hover:bg-muted transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-center">{label}</span>
            {children}
        </div>
    );
}

export function QuickActionsCard({ stores, owners, onCreated }: { stores: Store[]; owners: Owner[]; onCreated: () => void }) {
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
                        trigger={<ActionTile icon={StoreIcon} label="Add Store" />}
                    />

                    <CreateOwnerDialog
                        owners={owners}
                        onCreated={onCreated}
                        trigger={<ActionTile icon={UserPlus} label="Add Owner" />}
                    />

                    <div onClick={handleCopyMonitorLink}>
                        <ActionTile icon={copied ? Check : Link2} label={copied ? "Copied!" : "Copy Monitor Link"} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}