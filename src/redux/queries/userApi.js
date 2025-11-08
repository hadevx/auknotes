import { apiSlice } from "./apiSlice";

const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (data) => ({
        url: "/api/users/login",
        method: "POST",
        body: data,
      }),
    }),
    registerUser: builder.mutation({
      query: (data) => ({
        url: "/api/users/register",
        method: "POST",
        body: data,
      }),
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: "/api/users/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    createAddress: builder.mutation({
      query: (data) => ({
        url: "/api/users/address",
        method: "POST",
        body: data,
      }),
    }),
    getAddress: builder.query({
      query: (userId) => ({
        url: `/api/users/address/${userId}`,
      }),
    }),
    updateAddress: builder.mutation({
      query: (data) => ({
        url: "/api/users/address",
        method: "PUT",
        body: data,
      }),
    }),
    getUserDetails: builder.query({
      query: (userId) => ({
        url: `/api/users/${userId}`,
      }),
      providesTags: ["User"],
    }),
    getUserProfile: builder.query({
      query: () => ({
        url: `/api/users/profile`,
      }),
      providesTags: ["User"],
    }),
    getBlockStatus: builder.query({
      query: (id) => ({
        url: `/api/users/block-status/${id}`,
      }),
    }),
    getLatestUsers: builder.query({
      query: () => ({
        url: `/api/users/latest`,
      }),
    }),
    logoutApi: builder.mutation({
      query: () => ({
        url: `/api/users/logout`,
        method: "POST",
      }),
    }),
    toggleBlockUser: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}`,
        method: "PATCH",
      }),
    }),
    toggleFollow: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}/follow`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    purchaseCourses: builder.mutation({
      query: (data) => ({
        url: "/api/courses/purchase-all",
        method: "POST",
        body: data, // { orderId, userId }
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  /* useGetUsersQuery, */
  useGetUserDetailsQuery,
  useLogoutApiMutation,
  useCreateAddressMutation,
  useGetAddressQuery,
  useUpdateUserMutation,
  useUpdateAddressMutation,
  useToggleBlockUserMutation,
  useGetBlockStatusQuery,
  useToggleFollowMutation,
  useGetUserProfileQuery,
  usePurchaseCoursesMutation,
  useGetLatestUsersQuery,
} = userApi;
