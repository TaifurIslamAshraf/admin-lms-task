import { LoginRequest, LoginResponse } from "@/types/auth";
import type { IUser } from "@/types/user";
import { apiSlice } from "../apiSlice/apiSlice";
import { userLogin, userLogout, userRegister } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.accessToken) {
            dispatch(
              userLogin({
                accessToken: data.accessToken,
                user: data.user,
              })
            );
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),

    logout: build.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(userLogout());
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
    }),

    getMe: build.query<{ data: IUser }, void>({
      query: () => "/user/me",
      providesTags: ["Users"],
      transformResponse: (response: { data: IUser }) => response,
    }),

    register: build.mutation({
      query: (data) => ({
        url: "/user/register",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: ["Users"],

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          console.log(data);
          dispatch(userRegister({ token: data?.data.activationToken }));
        } catch (error) {
          console.log(error);
        }
      },
    }),

    activation: build.mutation({
      query: (data) => ({
        url: "/user/activate",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    resetPassword: build.mutation({
      query: (data) => ({
        url: "/user/reset-password",
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    forgotPassword: build.mutation({
      query: ({ email, userType }) => ({
        url: "/user/forgot-password",
        method: "POST",
        body: { email, userType },

        credentials: "include",
      }),
    }),
    getAllUsers: build.query({
      query: () => ({
        url: "/user/all-users",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Users"],
    }),

    updateUserRole: build.mutation({
      query: ({ data }) => ({
        url: "/user/update-role",
        method: "PUT",
        body: data,

        credentials: "include",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useLogoutMutation,
  useLoginMutation,
  useGetMeQuery,
  useRegisterMutation,
  useActivationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
} = authApi;
