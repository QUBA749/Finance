import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/context/auth-context";
import { useCurrency, SUPPORTED_CURRENCIES } from "@/context/currency-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — FinanceAI" },
      { name: "description", content: "Manage your profile, notifications, security and preferences." },
    ],
  }),
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [updatingPwd, setUpdatingPwd] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle().then(({ data }) => {
      setDisplayName(data?.display_name ?? "");
    });
  }, [user]);

  const initials = (displayName || user?.email || "U").slice(0, 2).toUpperCase();

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
    setSavingProfile(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  const updatePassword = async () => {
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setUpdatingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPwd(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setNewPassword(""); }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Manage your account preferences" />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20"><AvatarFallback className="gradient-primary text-primary-foreground text-xl font-bold">{initials}</AvatarFallback></Avatar>
                <Button variant="outline" disabled>Upload new photo</Button>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Display name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1.5" /></div>
                <div><Label>Email</Label><Input value={user?.email ?? ""} disabled className="mt-1.5" /></div>
              </div>
              <div className="flex justify-end"><Button onClick={saveProfile} disabled={savingProfile} className="gradient-primary border-0 text-primary-foreground">{savingProfile ? "Saving…" : "Save changes"}</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                ["Email notifications", "Receive updates via email"],
                ["Push notifications", "Browser push notifications"],
                ["Weekly report", "Summary of your finances every Monday"],
                ["Budget alerts", "Notify when nearing budget limits"],
                ["Large transaction alerts", "Notify on transactions > Rs. 50,000"],
              ].map(([title, desc], i) => (
                <div key={title} className="flex items-center justify-between">
                  <div><p className="font-medium text-sm">{title}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                  <Switch defaultChecked={i < 3} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>New password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1.5" /></div>
              </div>
              <Button onClick={updatePassword} disabled={updatingPwd || !newPassword}>{updatingPwd ? "Updating…" : "Update password"}</Button>
              <Separator />
              <div className="flex items-center justify-between">
                <div><p className="font-medium text-sm">Sign out</p><p className="text-xs text-muted-foreground">End your session on this device</p></div>
                <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as typeof currency)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1.5">Base currency is PKR. Other currencies are converted at fixed rates.</p>
                </div>
                <div>
                  <Label>Theme</Label>
                  <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
