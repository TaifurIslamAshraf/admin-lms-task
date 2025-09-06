/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../apiSlice/apiSlice";

export const lectureApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    // Get all courses with their modules and lectures
    getAllCoursesWithModulesAndLectures: build.query({
      query: () => ({
        url: "/lectures/courses-with-modules-and-lectures",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Lectures"],
      transformResponse: (response: any) => response.data || [],
    }),

    // Create new lecture
    createLecture: build.mutation({
      query: (lectureData: any) => ({
        url: "/lectures",
        method: "POST",
        body: lectureData,
        credentials: "include",
      }),
      invalidatesTags: ["Lectures"],
    }),

    // Update lecture
    updateLecture: build.mutation({
      query: ({ id, ...updates }: { id: string; [key: string]: any }) => ({
        url: `/lectures/${id}`,
        method: "PUT",
        body: updates,
        credentials: "include",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Lectures", id: arg.id || "" },
        "Lectures"
      ],
    }),

    // Delete lecture
    deleteLecture: build.mutation({
      query: (id: string) => ({
        url: `/lectures/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Lectures", id: id || "" },
        "Lectures"
      ],
    }),

    // Add PDF note to lecture
    addPDFNote: build.mutation({
      query: ({ id, pdfPath }: { id: string; pdfPath: string }) => ({
        url: `/lectures/${id}/add-pdf`,
        method: "POST",
        body: { pdfPath },
        credentials: "include",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Lectures", id: arg.id || "" },
        "Lectures"
      ],
    }),

    // Remove PDF note from lecture
    removePDFNote: build.mutation({
      query: ({ id, pdfPath }: { id: string; pdfPath: string }) => ({
        url: `/lectures/${id}/remove-pdf`,
        method: "POST",
        body: { pdfPath },
        credentials: "include",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Lectures", id: arg.id || "" },
        "Lectures"
      ],
    }),
  }),
});

export const {
  useGetAllCoursesWithModulesAndLecturesQuery,
  useCreateLectureMutation,
  useUpdateLectureMutation,
  useDeleteLectureMutation,
  useAddPDFNoteMutation,
  useRemovePDFNoteMutation,
} = lectureApi;