import { apiSlice } from "./apiSlice";

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ pageNumber = 1, keyword = "" }) => ({
        url: `/api/products?pageNumber=${pageNumber}&keyword=${keyword}`,
      }),
      providesTags: ["Product"],
    }),
    getAllProducts: builder.query({
      query: () => ({
        url: "/api/products/all",
      }),
    }),
    getProductById: builder.query({
      query: (productId) => ({
        url: `/api/products/product/${productId}`,
      }),
    }),
    getProductsByCategory: builder.query({
      query: (id) => ({
        url: `/api/products/category/${id}`,
      }),
    }),
    updateStock: builder.mutation({
      query: (orderItems) => ({
        url: "/api/products/update-stock",
        method: "POST",
        body: orderItems,
      }),
    }),
    getDeliveryStatus: builder.query({
      query: () => ({
        url: `/api/products/delivery`,
      }),
    }),
    getDiscountStatus: builder.query({
      query: () => ({
        url: `/api/products/discount`,
      }),
    }),
    getLatestProducts: builder.query({
      query: () => ({
        url: "/api/products/latest",
      }),
    }),
    getCategoriesTree: builder.query({
      query: () => ({
        url: "/api/category/tree",
      }),
    }),
    fetchProductsByIds: builder.mutation({
      query: (productIds) => ({
        url: "/api/products/fetch-by-ids",
        method: "POST",
        body: { productIds },
      }),
    }),
    getMainCategoriesWithCounts: builder.query({
      query: () => ({
        url: "/api/category/main-cat-count",
      }),
    }),
    getCategoryById: builder.query({
      query: (id) => ({
        url: `/api/category/${id}`,
      }),
    }),
    getMainCategoriesWithCountsPaginamtion: builder.query({
      query: ({ pageNumber = 1, keyword = "" }) => ({
        url: `/api/category/all-categories?pageNumber=${pageNumber}&keyword=${keyword}`,
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCategoryQuery,
  useUpdateStockMutation,
  useGetDeliveryStatusQuery,
  useGetDiscountStatusQuery,
  useGetLatestProductsQuery,
  useGetCategoriesTreeQuery,
  useGetAllProductsQuery,
  useFetchProductsByIdsMutation,
  useGetMainCategoriesWithCountsQuery,
  useGetCategoryByIdQuery,
  useGetMainCategoriesWithCountsPaginamtionQuery,
} = productApi;
