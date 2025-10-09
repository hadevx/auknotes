import { useState } from "react";
import Layout from "../../Layout.js";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, setUserInfo } from "../../redux/slices/authSlice.js";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner.js";
import { useUpdateUserMutation, useGetBlockStatusQuery } from "../../redux/queries/userApi.js";
import { Edit, LogOut } from "lucide-react";
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FormatDate from "@/components/FormatDate.js";

export function AlertDemo() {
  return (
    <div className="grid w-full max-w-xl items-start gap-4">
      <Alert>
        <CheckCircle2Icon />
        <AlertTitle>Success! Your changes have been saved</AlertTitle>
        <AlertDescription>This is an alert with icon, title and description.</AlertDescription>
      </Alert>
      <Alert>
        <PopcornIcon />
        <AlertTitle>This Alert has a title and an icon. No description.</AlertTitle>
      </Alert>
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Unable to process your payment.</AlertTitle>
        <AlertDescription>
          <p>Please verify your billing information and try again.</p>
          <ul className="list-inside list-disc text-sm">
            <li>Check your card details</li>
            <li>Ensure sufficient funds</li>
            <li>Verify billing address</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}

const avatarOptions = [
  "/empty.jpg",
  "/avatar/1.jpg",
  "/avatar/2.jpg",
  "/avatar/3.jpg",
  "/avatar/4.jpg",
  "/avatar/5.jpg",
  "/avatar/6.jpg",
  "/avatar/8.jpg",
  "/avatar/9.jpg",
  "/avatar/10.jpg",
  "/avatar/11.jpg",
  "/avatar/12.jpg",
  "/avatar/13.jpg",
  "/avatar/14.webp",
  "/avatar/15.webp",
  "/avatar/16.webp",
];

function Profile() {
  const [editPersonal, setEditPersonal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [editAvatar, setEditAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state: any) => state.auth.userInfo);

  console.log(userInfo);
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const { data: isBlocked } = useGetBlockStatusQuery(userInfo._id);

  console.log("block status:", isBlocked);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/");
  };

  const handleUpdatePersonal = async () => {
    try {
      const res = await updateUser({
        name: newName || userInfo?.name,
        email: newEmail || userInfo?.email,
        avatar: selectedAvatar !== "/empty.jpg" ? selectedAvatar : "",
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
      <div className="min-h-screen  flex flex-col items-center py-10 px-4">
        {/* Header */}
        <div className="w-full max-w-4xl bg-white rounded-2xl border p-6 text-center md:text-left md:flex md:items-center md:gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0 mb-4 md:mb-0  justify-center flex">
            {userInfo?.avatar ? (
              <img
                src={userInfo.avatar}
                alt="User Avatar"
                className="w-32 h-32 md:w-48 md:h-48 rounded-full md:rounded-lg shadow object-cover"
              />
            ) : (
              <div className="w-32 h-32 md:w-48 md:h-48 uppercase rounded-lg bg-tomato flex items-center justify-center text-white font-bold text-4xl md:text-5xl shadow">
                {userInfo?.username?.charAt(0)}
                {userInfo?.username?.charAt(userInfo?.username.length - 1)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl   md:text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-between">
              {userInfo?.name}
              <button
                onClick={handleLogout}
                className="p-2 hidden md:flex  bg-tomato shadow  gap-2 items-center text-lg text-white rounded-lg font-medium transition-colors duration-200">
                Logout <LogOut size={20} />
              </button>
            </h1>
            <p className="text-gray-500 mt-1">@{userInfo.username}</p>
            <p className="text-gray-500 mt-1">{userInfo?.email}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">
              {isBlocked ? (
                <Alert variant="destructive" className="flex flex-col ">
                  <div className="flex items-center justify-center lg:justify-start w-full gap-2">
                    <AlertCircleIcon />
                    <AlertTitle className="font-bold text-lg">Account Blocked</AlertTitle>
                  </div>
                  <AlertDescription>
                    <p>
                      Your account has been temporarily suspended due to a violation of our terms of
                      service. Please contact @auknotes if you think this is a mistake
                    </p>
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <button
                    onClick={() => setEditPersonal(!editPersonal)}
                    className="p-2 bg-zinc-100 text-black rounded-lg font-medium border transition-colors duration-200">
                    {editPersonal ? "Cancel" : <Edit />}
                  </button>
                  <button
                    onClick={() => setEditAvatar(!editAvatar)}
                    className="p-2 bg-zinc-100 text-black rounded-lg font-medium border transition-colors duration-200">
                    {editAvatar ? "Cancel Avatar" : "Edit Avatar"}
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="p-2 md:hidden flex items-center gap-2 bg-tomato text-white rounded-lg font-medium transition-colors duration-200">
                Logout
                <LogOut size={20} />
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
                <span className="font-semibold text-gray-900">Username:</span> @{userInfo?.username}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Name:</span> {userInfo?.name}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Email:</span> {userInfo?.email}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Joined in:</span>{" "}
                <FormatDate date={userInfo?.createdAt} />
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
                className="mt-2 bg-tomato text-white rounded-lg py-2 font-semibold shadow transition-colors duration-200 disabled:opacity-50">
                {isLoading ? <Spinner className="border-t-transparent" /> : "Update"}
              </button>
            </div>
          )}
        </div>

        {/* Avatar Selection */}
        {editAvatar && (
          <div className="w-full max-w-4xl mt-3 bg-white rounded-2xl border p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Choose Avatar</h2>
            <div className="flex flex-wrap gap-2">
              {avatarOptions.map((avatar, idx) => (
                <img
                  key={idx}
                  src={avatar}
                  alt="Avatar option"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-16 h-16 md:w-24 md:h-24 rounded-lg cursor-pointer object-cover border-2 ${
                    selectedAvatar === avatar ? "border-blue-600" : "border-transparent"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleUpdatePersonal}
              disabled={isLoading}
              className="mt-4 w-full bg-black text-white py-2 rounded-lg font-semibold transition disabled:opacity-50">
              {isLoading ? <Spinner className="border-t-transparent" /> : "Save Avatar"}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Profile;
