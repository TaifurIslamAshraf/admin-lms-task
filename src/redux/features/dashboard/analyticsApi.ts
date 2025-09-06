import { apiSlice } from "../apiSlice/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
  
    getCardAnalytics: build.query({
      query: () => ({
        url: "/analytics/overview",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Analytics"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformResponse: (response: any) => {
        // Transform the response to match our UI needs
        const { data } = response;
        return {
          totalCourses: data?.courseCount || 0,
          totalStudents: data?.userCount || 0,
          enrolledCourses: data?.enrolledCourses || 0,
          courseTrend: data?.courseTrend || 0,
          studentTrend: data?.studentTrend || 0,
          enrollmentTrend: data?.enrollmentTrend || 0,
        };
      },
    }),

   
  }),
});

export const {
useGetCardAnalyticsQuery
} = authApi;
