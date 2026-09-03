import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [profileMsg, setProfileMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const [monitorToken, setMonitorToken] = useState(user?.monitorToken ?? "");

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    await api.put("/auth/profile", { name });
    setProfileMsg("Profile updated successfully");
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordMsg("");
    try {
      await api.put("/auth/password", { currentPassword, newPassword });
      setPasswordMsg("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setPasswordMsg("Current password is incorrect");
    }
  }

  async function handleRegenerateToken() {
    const res = await api.post<{ monitorToken: string }>("/auth/regenerate-monitor-token");
    setMonitorToken(res.data.monitorToken);
  }

  const monitorUrl = `${window.location.origin}/monitor/${monitorToken}`;

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card>
        <CardHeader><CardTitle className="text-sm">Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Email</Label>
              <Input value={user?.email} disabled />
            </div>
            {profileMsg && <p className="text-sm text-muted-foreground">{profileMsg}</p>}
            <Button type="submit" className="self-start">Save</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
            </div>
            {passwordMsg && <p className="text-sm text-muted-foreground">{passwordMsg}</p>}
            <Button type="submit" className="self-start">Change Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Public Monitor</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground break-all">{monitorUrl}</p>
          <Separator />
          <Button variant="outline" className="self-start" onClick={handleRegenerateToken}>
            Regenerate Token
          </Button>
          <p className="text-xs text-muted-foreground">
            Regenerating will make the old link inaccessible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}