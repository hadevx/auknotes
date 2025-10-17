import { useState } from "react";
import Layout from "../../Layout.js";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { logout, setUserInfo } from "../../redux/slices/authSlice.js";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner.js";
import {
  useUpdateUserMutation,
  useGetUserDetailsQuery,
  useLogoutApiMutation,
} from "../../redux/queries/userApi.js";
import { Edit, LogOut, AlertCircleIcon, CheckCircle2, Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FormatDate from "@/components/FormatDate.js";
import { avatars } from "./avatars.ts";
import Skeleton from "@/components/Skeleton.tsx";
import Loader from "@/components/Loader.tsx";

function Profile() {
  const { id } = useParams();
  const { data: userInfo, isLoading: loadingUser } = useGetUserDetailsQuery(id);
  const [logoutApi] = useLogoutApiMutation();

  console.log(userInfo);

  const [isLoaded, setIsLoaded] = useState(false);
  const [editPersonal, setEditPersonal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [editAvatar, setEditAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(userInfo?.avatar);

  console.log(selectedAvatar);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const handleLogout = async () => {
    await dispatch(logout());
    await logoutApi();
    navigate("/");
  };

  const handleUpdatePersonal = async () => {
    try {
      const res = await updateUser({
        name: newName || userInfo?.name,
        email: newEmail || userInfo?.email,
        avatar: selectedAvatar === "empty.webp" ? "" : selectedAvatar,
      }).unwrap();
      dispatch(setUserInfo(res));
      toast.success("Updated successfully");
      setEditPersonal(false);
      setEditAvatar(false);
    } catch (error) {
      toast.error(error?.data?.message || "Error updating info");
    }
  };

  return (
    <Layout>
      {loadingUser ? (
        <Loader />
      ) : (
        <div className="min-h-screen flex flex-col items-center py-10 px-4">
          {/* Header */}
          <div className="w-full max-w-4xl bg-white rounded-2xl border p-6 text-center sm:text-left sm:flex sm:gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0 mb-4 md:mb-0 justify-center flex">
              {userInfo?.avatar ? (
                <img
                  src={`/avatar/${userInfo?.avatar}`}
                  alt="User Avatar"
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full sm:rounded-lg shadow object-cover"
                />
              ) : (
                <div className="w-32 h-32 sm:w-48 sm:h-48 uppercase rounded-full sm:rounded-lg bg-tomato flex items-center justify-center text-white font-bold text-4xl sm:text-5xl shadow">
                  {userInfo?.username?.charAt(0)}
                  {userInfo?.username?.charAt(userInfo?.username?.length - 1)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center sm:justify-between">
                <span className="flex items-center gap-2">
                  {userInfo?.name}
                  {userInfo?.isVerified && <img src="/verify.png" alt="" className="size-6" />}
                  {userInfo?.isAdmin && <img src="/admin.png" alt="" className="size-6" />}
                </span>

                <button
                  onClick={handleLogout}
                  className="p-2 hidden sm:flex bg-gradient-to-t from-zinc-900 to-zinc-700  shadow-[0_7px_15px_rgba(0,0,0,0.5)] hover:scale-[0.995]  gap-2 items-center text-lg text-white rounded-lg font-medium transition-colors duration-200">
                  Logout <LogOut size={20} />
                </button>
              </h1>
              <p className="text-gray-500 mt-1">@{userInfo?.username}</p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-5">
                {userInfo?.isBlocked ? (
                  <Alert variant="destructive" className="flex flex-col">
                    <div className="flex items-center justify-center lg:justify-start w-full gap-2">
                      <AlertCircleIcon />
                      <AlertTitle className="font-bold text-lg">Account Blocked</AlertTitle>
                    </div>
                    <AlertDescription>
                      <p>
                        Your account has been temporarily suspended due to a violation of our terms
                        of service. Please contact @auknotes if you think this is a mistake.
                      </p>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <button
                      onClick={() => setEditPersonal(!editPersonal)}
                      className="p-2 text-sm sm:text-lg bg-zinc-100 text-black rounded-lg font-medium border transition-colors duration-200">
                      {editPersonal ? "Cancel" : <Edit className="size-5" />}
                    </button>
                    <button
                      onClick={() => setEditAvatar(!editAvatar)}
                      className="p-2 text-sm sm:text-lg bg-zinc-100 text-black rounded-lg font-medium border transition-colors duration-200">
                      {editAvatar ? "Cancel Avatar" : "Edit Avatar"}
                    </button>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 text-sm sm:hidden flex items-center gap-2  bg-gradient-to-t from-zinc-900 to-zinc-700  shadow-[0_7px_15px_rgba(0,0,0,0.5)] hover:scale-[0.995] text-white rounded-lg font-medium transition-colors duration-200">
                  Logout
                  <LogOut className="size-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="w-full max-w-4xl mt-3 bg-white rounded-2xl border p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Personal Information
            </h2>

            {!editPersonal ? (
              <div className="space-y-3 text-gray-700">
                <p>
                  <span className="font-semibold text-gray-900">Username:</span> @
                  {userInfo?.username}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Name:</span> {userInfo?.name}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Email:</span> {userInfo?.email}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Joined on:</span>{" "}
                  <FormatDate variant="full" date={userInfo?.createdAt} />
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter new name"
                  className="px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email"
                  className="px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <button
                  onClick={handleUpdatePersonal}
                  disabled={isLoading}
                  className="mt-2 flex justify-center items-center  bg-gradient-to-t from-zinc-900 to-zinc-700  shadow-[0_7px_15px_rgba(0,0,0,0.5)] hover:scale-[0.995] text-white rounded-lg py-2 font-semibold  transition-colors duration-200 disabled:opacity-50">
                  {isLoading ? <Spinner className="border-t-transparent" /> : "Update"}
                </button>
              </div>
            )}
          </div>

          {/* Avatar Selection */}
          {editAvatar && (
            <div className="w-full max-w-4xl mt-3 bg-white rounded-2xl border p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Choose Avatar</h2>

              {/* Avatar Grid */}
              <div className="flex flex-wrap gap-1">
                {avatars.map((avatar, idx) => {
                  const isLocked = idx === avatars.length - 1; // last one locked
                  return (
                    <div key={idx} className="relative w-16 h-16 md:w-24 md:h-24">
                      {!isLoaded && (
                        <div className="absolute inset-0">
                          <Skeleton className="w-full h-full rounded-lg" />
                        </div>
                      )}

                      <img
                        src={`/avatar/${avatar}`}
                        alt="Avatar option"
                        onLoad={() => setIsLoaded(true)}
                        onClick={() => !isLocked && setSelectedAvatar(avatar)} // prevent click
                        className={`w-full h-full rounded-lg object-cover border-2 transition-all duration-200 cursor-pointer
              ${
                selectedAvatar === avatar && !isLocked
                  ? "border-blue-600 scale-105"
                  : "border-transparent"
              }
              ${isLocked ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
              ${!isLoaded ? "opacity-0" : "opacity-100"}`}
                      />

                      {/* 🔒 Lock overlay for last avatar */}
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                          <Lock className="text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleUpdatePersonal}
                disabled={isLoading}
                className="mt-4 w-full flex justify-center  bg-gradient-to-t from-zinc-900 to-zinc-700  shadow-[0_7px_15px_rgba(0,0,0,0.5)] hover:scale-[0.995] text-white py-2 rounded-lg font-semibold transition disabled:opacity-50">
                {isLoading ? <Spinner className="border-t-transparent" /> : "Save Avatar"}
              </button>
            </div>
          )}

          {/* Verification Badge Section */}
          <div className="w-full max-w-4xl mt-3 bg-white rounded-2xl border p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
              Verification Badge
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-zinc-50 p-5 border rounded-xl w-full ">
                <img
                  src="/image.png"
                  alt="User example"
                  className="size-20  rounded-full lg:rounded-md object-cover"
                />
                <div className="flex items-center sm:items-start flex-col">
                  <p className="font-bold text-2xl  text-gray-900 flex items-center gap-1">
                    {userInfo?.name} <img src="/verify.png" alt="" className="size-5" />
                  </p>
                  <p className="text-base text-gray-500">@{userInfo?.username}</p>
                </div>
              </div>

              <p className="text-gray-700 text-sm md:text-base">
                Want to get <span className="font-semibold text-blue-600">verification badge</span>{" "}
                and <span className="font-semibold text-blue-600">custom avatar</span>? Contact us
                on Instagram{" "}
                <a
                  href="https://instagram.com/auknotes"
                  target="_blank"
                  className="underline text-blue-500">
                  @auknotes
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Profile;
