import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Lock, Link2, Copy, Check, RotateCcw, CircleAlert } from "lucide-react";
import { profileFormSchema, type ProfileForm, changePasswordFormSchema, type ChangePasswordForm } from "@/lib/validation";
import { LoadingScreen } from "@/components/loading-screen";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const [monitorToken, setMonitorToken] = useState(user?.monitorToken ?? "");

  useEffect(() => {
    if (user?.monitorToken) {
      setMonitorToken(user.monitorToken);
    }
  }, [user?.monitorToken]);
  const [copied, setCopied] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: { name: user?.name ?? "" },
  });

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordFormSchema),
    mode: "onChange",
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  async function onSubmitProfile(values: ProfileForm) {
    await api.put("/auth/profile", values, { suppressGlobalError: true });
    toast.success("Profile updated successfully.");
  }

  async function onSubmitPassword(values: ChangePasswordForm) {
    try {
      await api.put("/auth/password", values, { suppressGlobalError: true });
      toast.success("Password updated successfully.");
      passwordForm.reset({ currentPassword: "", newPassword: "" });
    } catch {
      passwordForm.setError("currentPassword", { type: "server", message: "Current password is incorrect." });
    }
  }

  async function handleRegenerateToken() {
    const res = await api.post<{ monitorToken: string }>("/auth/regenerate-monitor-token");
    setMonitorToken(res.data.monitorToken);
    toast.success("Monitor link regenerated.");
    setRegenerateOpen(false);
  }

  function handleCopyMonitorUrl() {
    navigator.clipboard.writeText(monitorUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const monitorUrl = `${window.location.origin}/monitor/${monitorToken}`;

  if (!user) return <LoadingScreen />;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-chart-2">
        <div className="flex flex-col gap-6 max-w-lg">
          <span className="text-lg font-semibold text-foreground">Settings</span>

          <Card>
            <CardHeader><CardTitle className="text-sm">Profile</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="flex flex-col gap-4">
                <Controller
                  name="name"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Name</FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupAddon align="inline-start"><User className="size-3.5" /></InputGroupAddon>
                          <InputGroupInput aria-invalid={fieldState.invalid} {...field} />
                        </InputGroup>
                        {fieldState.invalid && (
                          <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                            <CircleAlert className="size-4" />
                            <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                          </Alert>
                        )}
                      </FieldContent>
                    </Field>
                  )}
                />

                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon align="inline-start"><Mail className="size-3.5" /></InputGroupAddon>
                      <InputGroupInput value={user?.email} disabled />
                    </InputGroup>
                  </FieldContent>
                </Field>
                <Button type="submit" className="self-start">Save</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Change Password</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="flex flex-col gap-4">
                <Controller
                  name="currentPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Current Password</FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupAddon align="inline-start"><Lock className="size-3.5" /></InputGroupAddon>
                          <InputGroupInput placeholder="Current Password" type="password" aria-invalid={fieldState.invalid} {...field} />
                        </InputGroup>
                        {fieldState.invalid && (
                          <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                            <CircleAlert className="size-4" />
                            <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                          </Alert>
                        )}
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  name="newPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>New Password</FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupAddon align="inline-start"><Lock className="size-3.5" /></InputGroupAddon>
                          <InputGroupInput placeholder="New Password" type="password" aria-invalid={fieldState.invalid} {...field} />
                        </InputGroup>
                        {fieldState.invalid && (
                          <Alert className="mt-3 flex p-2 rounded-md text-destructive bg-destructive/10 border-destructive/10">
                            <CircleAlert className="size-4" />
                            <AlertDescription><FieldError errors={[fieldState.error]} /></AlertDescription>
                          </Alert>
                        )}
                      </FieldContent>
                    </Field>
                  )}
                />
                <Button type="submit" className="self-start">Change Password</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Public Monitor</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <InputGroup className="flex-1">
                  <InputGroupAddon align="inline-start"><Link2 className="size-3.5" /></InputGroupAddon>
                  <InputGroupInput value={monitorUrl} readOnly className="text-muted-foreground" />
                </InputGroup>
                <Button variant="outline" size="icon" onClick={handleCopyMonitorUrl}>
                  {copied ? <Check className="h-4 w-4 text-chart-2" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Separator />

              <AlertDialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
                <Button variant="outline" className="self-start gap-1.5" onClick={() => setRegenerateOpen(true)}>
                  <RotateCcw className="h-4 w-4" /> Regenerate Token
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Regenerate monitor link?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The current link will stop working immediately. Anyone using the old link
                      (embedded on a stream overlay, bookmarked, etc.) will lose access until you share the new one.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setRegenerateOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRegenerateToken}>Regenerate</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}