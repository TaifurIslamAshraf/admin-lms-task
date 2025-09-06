import { apiSlice } from "../apiSlice/apiSlice";
import { userLogin } from "./authSlice";

export const googleAuthApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initiateGoogleAuth: builder.mutation({
      query: () => ({
        url: "/auth/google",
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.redirectUrl) {
            window.location.href = data.data.redirectUrl;
          }
        } catch (error) {
          console.error("Failed to initiate Google auth:", error);
        }
      },
    }),
    verifyGoogleAuth: builder.mutation({
      query: () => ({
        url: "/auth/google/verify",
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            userLogin({
              accessToken: data.accessToken,
              user: data.user,
            })
          );
        } catch (error) {
          console.error("Google auth verification failed", error);
        }
      },
    }),
  }),
});

export const { useInitiateGoogleAuthMutation, useVerifyGoogleAuthMutation } =
  googleAuthApi;
