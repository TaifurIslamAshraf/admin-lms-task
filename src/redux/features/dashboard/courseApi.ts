/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../apiSlice/apiSlice";

export const courseApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({

    // Get all courses for admin dashboard
    getAllCourses: build.query({
      query: (args: { page?: number; limit?: number; search?: string } = {}) => {
        const { page = 1, limit = 10, search = "" } = args;
        return {
          url: "/courses",
          method: "GET",
          params: { page, limit, search },
          credentials: "include",
        };
      },
      providesTags: ["Courses"],
      transformResponse: (response: any) => {
        const { data, total, page: currentPage, limit: pageLimit } = response;
        return {
          courses: data || [],
          pagination: {
            total: total || 0,
            page: currentPage || 1,
            limit: pageLimit || 10,
            totalPages: Math.ceil((total || 0) / (pageLimit || 10)),
          },
        };
      },
    }),

    // Get course by ID with detailed information
    getCourseById: build.query({
      query: (id: string) => ({
        url: `/courses/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, id) => [{ type: "Courses", id: id || "" }],
      transformResponse: (response: any) => response.data,
    }),

    // Create new course
    createCourse: build.mutation({
      query: (courseData: any) => ({
        url: "/courses",
        method: "POST",
        body: courseData,
        credentials: "include",
      }),
      invalidatesTags: ["Courses"],
    }),

    // Update course
    updateCourse: build.mutation({
      query: ({ id, ...updates }: { id: string; [key: string]: any }) => ({
        url: `/courses/${id}`,
        method: "PUT",
        body: updates,
        credentials: "include",
      }),
      invalidatesTags: (result, error, arg) => {
        const { id } = arg as { id: string };
        return [{ type: "Courses", id: id || "" }, "Courses"];
      },
    }),

    // Delete course
    deleteCourse: build.mutation({
      query: (id: string) => ({
        url: `/courses/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Courses", id: id || "" },
        "Courses"
      ],
    }),

    // Get course preview (public endpoint for preview mode)
    getCoursePreview: build.query({
      query: (id: string) => ({
        url: `/courses/${id}/preview`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, id) => [{ type: "Courses", id: id || "", mode: "preview" }],
      transformResponse: (response: any) => response.data,
    }),

  }),
});

export const {
  useGetAllCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursePreviewQuery,
} = courseApi;