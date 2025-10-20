import { useState, useEffect } from "react";
import Layout from "@/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { useGetUserDetailsQuery, useToggleFollowMutation } from "@/redux/queries/userApi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const UserProfile = () => {
  const { id } = useParams();
  const { data: user, isLoading, isError } = useGetUserDetailsQuery(id);
  console.log(user);

  const currentUser = useSelector((state: any) => state.auth.userInfo);
  const navigate = useNavigate();

  if (isLoading)
    return (
      <Layout>
        <div className="min-h-screen flex justify-center items-center">Loading...</div>
      </Layout>
    );

  if (isError || !user)
    return (
      <Layout>
        <div className="min-h-screen flex justify-center items-center text-red-500">
          User not found
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center py-10 px-4">
        {/* Back Button */}
        <div className="w-full max-w-4xl mb-4 flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1 rounded-full border bg-white hover:bg-zinc-100 text-black transition-colors font-medium text-sm">
            ← Back
          </button>
        </div>

        {/* Profile Card */}
        <div className="w-full max-w-4xl bg-white rounded-2xl  border p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {user.avatar ? (
              <img
                src={user?.avatar}
                alt={user?.username}
                className="w-32 h-32 md:w-48 md:h-48 rounded-full sm:rounded-md shadow object-cover"
              />
            ) : (
              <div className="w-32 h-32 md:w-48 md:h-48 uppercase rounded-full bg-tomato flex items-center justify-center text-white font-bold text-4xl md:text-5xl shadow">
                {user?.username?.charAt(0)}
                {user?.username?.charAt(user?.username?.length - 1)}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-500 mt-1">@{user?.username}</p>

            {/* Followers / Following */}
            {/*   <div className="flex gap-6 mt-4 text-gray-700">
              <div>
                <span className="font-semibold">{user.followers.length}</span> Followers
              </div>
              <div>
                <span className="font-semibold">{user.following.length}</span> Following
              </div>
            </div> */}

            {/* Follow / Unfollow Button */}
            {/*  {currentUser?._id !== user._id && (
              <button
                onClick={handleFollow}
                className={`mt-6 px-8 py-2 rounded-full font-semibold transition-shadow duration-200 ${
                  isFollowing
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300 "
                    : "bg-tomato text-white hover:bg-red-600 "
                }`}>
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )} */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
