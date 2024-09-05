import { apiSlice } from "./apiSlice.js";

const ADMIN_URL = "/api/admin";

export const admiApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    adminLogin: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/auth`,
        method: "POST",
        body: data,
      }),
    }),
    adminLogout: builder.mutation({
      query: () => ({
        url: `${ADMIN_URL}/logout`,
        method: "POST",
      }),
    }),
    adminUpdateUser: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/update-user`,
        method: "PUT",
        body: data,
      }),
    }),
    getUserData: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/get-user`,
        method: "POST",
      }),
    }),
    getVerificationData: builder.query({
      query: () => `${ADMIN_URL}/verification`,
    }),
    adminAcceptVerification: builder.mutation({
      query: (adminId) => ({
        url: `${ADMIN_URL}/verification/${adminId}/accept`,
        method: "PUT",
      }),
    }),

    adminRejectVerification: builder.mutation({
      query: ({ adminId, reason }) => ({
        url: `${ADMIN_URL}/verification/${adminId}/reject`,
        method: "PUT",
        body: { reason },
      }),
    }),

    adminBlockUser: builder.mutation({
      query: (body) => ({
        url: `${ADMIN_URL}/block-user`,
        method: "PATCH",
        body,
      }),
    }),
    adminUnblockUser: builder.mutation({
      query: (body) => ({
        url: `${ADMIN_URL}/unblock-user`,
        method: "PATCH",
        body,
      }),
    }),
    getAllHotelsData: builder.mutation({
      query: () => ({
        url: `${ADMIN_URL}/get-hotels`,
        method: "GET",
      }),
    }),
    adminListHotel: builder.mutation({
      query: ({ hotelId }) => ({
        url: `${ADMIN_URL}/list-hotel/${hotelId}`,
        method: "PATCH",
      }),
    }),
    adminUnlistHotel: builder.mutation({
      query: ({ hotelId }) => ({
        url: `${ADMIN_URL}/unlist-hotel/${hotelId}`,
        method: "PATCH",
      }),
    }),
    getAllBookings: builder.query({
      query: () => `${ADMIN_URL}/bookings`,
      method: "GET",
    }),
    getAdminStats: builder.query({
      query: () => `${ADMIN_URL}/stats`,
    }),
    getSalesReport: builder.query({
      query: ({ from, to }) => ({
        url: `${ADMIN_URL}/sales-report`,
        method: "POST",
        body: { from, to },
      }),
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useAdminLogoutMutation,
  useAdminUpdateUserMutation,
  useGetUserDataMutation,
  useGetVerificationDataQuery,
  useAdminAcceptVerificationMutation,
  useAdminRejectVerificationMutation,
  useAdminBlockUserMutation,
  useAdminUnblockUserMutation,
  useGetAllHotelsDataMutation,
  useAdminListHotelMutation,
  useAdminUnlistHotelMutation,
  useGetAllBookingsQuery,
  useGetAdminStatsQuery,
  useGetSalesReportQuery,
} = admiApiSlice;
