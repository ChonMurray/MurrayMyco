import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/account/settings");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-2">Account Settings</h1>
      <p className="text-foreground/70 mb-12">
        Manage your account preferences and security
      </p>

      {/* Profile Information */}
      <div className="backdrop-blur-[2px] bg-background/50 border border-white/10 rounded-lg p-8 mb-6">
        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              defaultValue={session.user.name || ""}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:border-white/20 transition-colors"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              defaultValue={session.user.email || ""}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:border-white/20 transition-colors"
              disabled
            />
            <p className="text-xs text-foreground/50 mt-1">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>
        </div>
      </div>

      {/* Security */}
      {!session.user.image && (
        <div className="backdrop-blur-[2px] bg-background/50 border border-white/10 rounded-lg p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <p className="text-sm text-foreground/70 mb-4">
            Update your password to keep your account secure
          </p>
          <button className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-md font-medium transition-colors">
            Change Password
          </button>
        </div>
      )}

      {/* Account Type */}
      <div className="backdrop-blur-[2px] bg-background/50 border border-white/10 rounded-lg p-8">
        <h2 className="text-xl font-semibold mb-4">Account Type</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {session.user.role === "admin" ? "Administrator" : "Customer"}
            </p>
            <p className="text-sm text-foreground/60 mt-1">
              {session.user.image
                ? "Signed in with Google"
                : "Email and password account"}
            </p>
          </div>
          {session.user.role === "admin" && (
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-sm font-medium rounded">
              Admin
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
