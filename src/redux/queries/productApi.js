import { apiSlice } from "./apiSlice";

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ pageNumber = 1, keyword = "" }) => ({
        url: `/api/products?pageNumber=${pageNumber}&keyword=${keyword}`,
      }),
      providesTags: ["Product"],
    }),
    getCourses: builder.query({
      query: () => ({
        url: `/api/course`,
      }),
    }),
    getCourseById: builder.query({
      query: (id) => ({
        url: `/api/course/${id}`,
      }),
    }),
    getFeaturedCourses: builder.query({
      query: () => ({
        url: "/api/course/featured",
      }),
    }),
    getProductsByCourse: builder.query({
      query: ({ courseId }) => ({
        url: `/api/products/course/${courseId}`,
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetFeaturedCoursesQuery,
  useGetProductsByCourseQuery,
} = productApi;
