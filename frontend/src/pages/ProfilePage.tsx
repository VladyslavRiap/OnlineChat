import {
  Camera,
  Edit,
  Mail,
  User,
  User2,
  Lock,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import logo from "../assets/vite.svg";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const {
    authUser,
    isUpdatingProfile,
    updateProfile,
    updateFullName,
    updateUsername,
    changePassword,
  } = useAuthStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [editName, setEditName] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    username: authUser?.username || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);
    setSelectedImg(URL.createObjectURL(file));

    await updateProfile(formData);
  };

  const handleSaveFullName = async () => {
    if (!formData.fullName.trim()) return;
    if (formData.fullName === authUser?.fullName) return setEditName(false);
    await updateFullName(formData.fullName);
    setEditName(false);
  };

  const handleSaveUsername = async () => {
    if (!formData.username.trim()) return;
    if (formData.username === authUser?.username) return setEditUsername(false);
    await updateUsername(formData.username);
    setEditUsername(false);
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (formData.currentPassword === formData.newPassword) {
      toast.error("New password is equal to current password");
      return setEditPassword(false);
    }
    await changePassword(formData.currentPassword, formData.newPassword);
    setEditPassword(false);
    setFormData({
      ...formData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="mx-auto max-w-2xl p-6 space-y-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={
                  selectedImg
                    ? selectedImg
                    : authUser?.profilePic
                    ? `http://localhost:5001${authUser.profilePic}`
                    : logo
                }
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                  isUpdatingProfile ? "animate-pulse" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile
                ? "Uploading"
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="size-4" />
                Full Name
              </div>
              {!editName ? (
                <div className="px-4 py-2.5 bg-base-200 rounded-lg border flex justify-between items-center">
                  {authUser?.fullName}
                  <button
                    onClick={() => setEditName(true)}
                    className="flex justify-center items-center hover:text-secondary/60"
                  >
                    <Edit className=" size-5 text-base-content/40 hover:text-base-content" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    className="input w-full input-bordered pr-16"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    autoFocus
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <button
                      onClick={handleSaveFullName}
                      className="btn btn-ghost btn-sm p-1 hover:text-green-500"
                      title="Save"
                    >
                      <Check className="size-5" />
                    </button>
                    <button
                      onClick={() => setEditName(false)}
                      className="btn btn-ghost btn-sm p-1 hover:text-red-500"
                      title="Cancel"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="size-4" />
                Email
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.email}
              </p>
            </div>

            <div className="space-y-1.5 ">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User2 className="size-4" />
                Username
              </div>
              {!editUsername ? (
                <div className="px-4 py-2.5 bg-base-200 rounded-lg border flex justify-between items-center">
                  {authUser?.username}
                  <button
                    onClick={() => setEditUsername(true)}
                    className="flex justify-center items-center hover:text-secondary/60"
                  >
                    <Edit className="size-5  text-base-content/40 hover:text-base-content" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    className="input w-full input-bordered"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    autoFocus
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <button
                      onClick={handleSaveUsername}
                      className="btn btn-ghost btn-sm p-1 hover:text-green-500"
                      title="Save"
                    >
                      <Check className="size-5" />
                    </button>
                    <button
                      onClick={() => setEditUsername(false)}
                      className="btn btn-ghost btn-sm p-1 hover:text-red-500"
                      title="Cancel"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Lock className="size-4" />
                Password
              </div>
              {!editPassword ? (
                <button
                  onClick={() => setEditPassword(true)}
                  className="w-full px-4 py-2.5 bg-base-200 rounded-lg border text-left hover:bg-base-200/80 transition-colors"
                >
                  Change Password
                </button>
              ) : (
                <div className="space-y-3 relative">
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Current Password"
                      className="input w-full input-bordered pr-10"
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="size-5 text-base-content/40 hover:text-base-content" />
                      ) : (
                        <Eye className="size-5 text-base-content/40 hover:text-base-content" />
                      )}
                    </button>
                  </div>
                  <div className=" relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New Password"
                      className="input w-full input-bordered pr-10"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="size-5 text-base-content/40 hover:text-base-content" />
                      ) : (
                        <Eye className="size-5 text-base-content/40 hover:text-base-content" />
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm New Password"
                      className="input w-full input-bordered"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-5 text-base-content/40 hover:text-base-content" />
                      ) : (
                        <Eye className="size-5 text-base-content/40 hover:text-base-content" />
                      )}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleChangePassword}
                      className="btn btn-primary flex-1"
                    >
                      Update Password
                    </button>
                    <button
                      onClick={() => setEditPassword(false)}
                      className="btn btn-ghost flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
