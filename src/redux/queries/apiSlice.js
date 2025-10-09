import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  // baseUrl: "https://backend.webschema.online",
  baseUrl: "http://localhost:4001",
  credentials: "include",
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Product", "Order", "User", "Status", "Topic"],
  endpoints: () => ({}),
});
