/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "@/lib/env";
import type { RefreshResponse } from "@/types/auth";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import type { RootState } from "../../store";
import { userLogin, userLogout } from "../auth/authSlice";

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = (await baseQuery(
          "/auth/refresh",
          api,
          extraOptions
        )) as { data: RefreshResponse };

        if (refreshResult.data?.data?.accessToken) {
          // Store the new tokens
          api.dispatch(
            userLogin({
              accessToken: refreshResult.data.data.accessToken,
              user: refreshResult.data.data.user,
            })
          );
          // Retry the initial query with new access token
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(userLogout());
        }
      } catch (error) {
        api.dispatch(userLogout());
        console.log(error);
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Analytics",
    "Users",
    "Courses",
    "Upload",
    "Modules",
    "CoursesWithModules",
    "Lectures"
  ],
  endpoints: (builder) => ({
    userInfo: builder.query({
      query: () => "/user/me",
      transformResponse: (response: { data: any }) => response.data,
      async onQueryStarted(arg, { queryFulfilled, dispatch, getState }) {
        try {
          const state = getState() as RootState;
          if (!state.auth.token) {
            return;
          }

          const { data } = await queryFulfilled;
          dispatch(userLogin({ user: data }));
        } catch (error: any) {
          if (error?.error?.status === 401) {
            dispatch(userLogout());
          }
          console.error("Error fetching user info:", error);
        }
      },
    }),

    googleAuthVerify: builder.query({
      query: () => "/auth/google/verify",
      transformResponse: (response: { data: any }) => response.data,
    }),
  }),
});

export const { useUserInfoQuery, useGoogleAuthVerifyQuery } = apiSlice;
