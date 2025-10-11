import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl:
    import.meta.env.VITE_ENVIRONMENT === "production"
      ? import.meta.env.VITE_API_URL
      : "http://localhost:4001",
  credentials: "include",
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Product", "Order", "User", "Status", "Topic"],
  endpoints: () => ({}),
});
