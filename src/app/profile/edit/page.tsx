
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | undefined>();
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);

      // Load profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, name, age, gender, location, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUsername(profile.username || "");
        setName(profile.name || "");
        setAge(profile.age || undefined);
        setGender(profile.gender || "");
        setLocation(profile.location || "");
        setAvatarUrl(profile.avatar_url || "");
      }
    };

    getUser();
  }, [router]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("Please select an image to upload.");
      }

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update profile avatar_url
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (dbError) throw dbError;

      setAvatarUrl(publicUrl);
      setMessage("✅ Avatar updated successfully!");
    } catch (err: any) {
      console.error("Upload error:", err.message);
      setMessage("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteAvatar() {
    try {
      if (!avatarUrl) return;

      // Extract file name from URL
      const parts = avatarUrl.split("/");
      const fileName = parts[parts.length - 1];

      // Remove from storage
      await supabase.storage.from("avatars").remove([fileName]);

      // Remove from DB
      await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);

      setAvatarUrl("");
      setMessage("✅ Avatar deleted successfully!");
    } catch (err: any) {
      console.error("Delete error:", err.message);
      setMessage("❌ Delete failed");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // ✅ Update profile data
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      username,
      name,
      age,
      gender,
      location,
      avatar_url: avatarUrl,
    });

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    // ✅ Password update (optional)
    if (currentPassword && newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        setMessage("❌ New passwords do not match");
        setLoading(false);
        return;
      }

      // Re-authenticate
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (reauthError) {
        setMessage("❌ Current password is incorrect");
        setLoading(false);
        return;
      }

      const { error: pwError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (pwError) {
        setMessage(pwError.message);
        setLoading(false);
        return;
      }
    }

    setMessage("✅ Profile updated successfully!");
    setLoading(false);
    router.push(`/profile/${username || user.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium">Avatar</label>
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
              />
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium">Age</label>
            <input
              type="number"
              value={age ?? ""}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Passwords */}
          <div>
            <label className="block text-sm font-medium">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Leave empty if not changing password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
}
