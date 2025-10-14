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
      query: ({ pageNumber = 1, keyword = "" }) => ({
        url: `/api/course?pageNumber=${pageNumber}&keyword=${keyword}`,
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
