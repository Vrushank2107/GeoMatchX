"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/loading-state";
import { toast } from "sonner";
import { Key, LogOut, Shield, Building2 } from "lucide-react";

export default function EditCompanyProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/sme/profile");
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            city: data.city || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/sme/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        router.push("/sme/profile/me");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <AuthGuard requireAuth requireSME>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">Company Profile & Settings</p>
          <h1 className="text-3xl font-semibold">Edit Profile & Settings</h1>
          <p className="text-sm text-zinc-500">Update your company information and account settings.</p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>Update your company details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Company Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled
                      />
                      <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">City</label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g., Mumbai, Delhi"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Profile Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/sme/profile/me")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <Input value={user?.name || ""} disabled />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={user?.email || ""} disabled />
                  <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Account Type</label>
                  <Input value={user?.userType || ""} disabled />
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Current Password</label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">New Password</label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-zinc-500 mt-1">Must be at least 8 characters</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={handleLogout} className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

