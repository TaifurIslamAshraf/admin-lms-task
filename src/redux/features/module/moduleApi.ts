/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../apiSlice/apiSlice";

export const moduleApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    // Get all modules
    getAllModules: build.query({
      query: (params?: { page?: number; limit?: number; search?: string }) => ({
        url: "/modules",
        method: "GET",
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          search: params?.search || "",
        },
        credentials: "include",
      }),
      providesTags: ["Modules"],
      transformResponse: (response: any) => ({
        modules: response.data || [],
        pagination: {
          total: response.total || 0,
          page: response.page || 1,
          limit: response.limit || 10,
          totalPages: response.totalPages || 0,
        },
      }),
    }),

    // Get single module by ID
    getModuleById: build.query({
      query: (id: string) => ({
        url: `/modules/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, id) => [{ type: "Modules", id: id || "" }],
      transformResponse: (response: any) => response.data,
    }),

    // Get modules by course ID
    getModulesByCourseId: build.query({
      query: (courseId: string) => ({
        url: `/modules/course/${courseId}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Modules"],
      transformResponse: (response: any) => response.data || [],
    }),

    // Get all courses with their modules
    getAllCoursesWithModules: build.query({
      query: () => ({
        url: "/modules/courses-with-modules",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["CoursesWithModules"],
      transformResponse: (response: any) => response.data || [],
    }),

    // Create new module
    createModule: build.mutation({
      query: (moduleData: any) => ({
        url: "/modules",
        method: "POST",
        body: moduleData,
        credentials: "include",
      }),
      invalidatesTags: ["Modules"],
    }),

    // Update module
    updateModule: build.mutation({
      query: ({ id, ...updates }: { id: string; [key: string]: any }) => ({
        url: `/modules/${id}`,
        method: "PUT",
        body: updates,
        credentials: "include",
      }),
      invalidatesTags: (result, error, arg) => {
        const { id } = arg as { id: string; [key: string]: any };
        return [{ type: "Modules", id: id || "" }, "Modules"];
      },
    }),

    // Delete module
    deleteModule: build.mutation({
      query: (id: string) => ({
        url: `/modules/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Modules", id: id || "" },
        "Modules"
      ],
    }),

    // Reorder modules
    reorderModules: build.mutation({
      query: ({ courseId, moduleIds }: { courseId: string; moduleIds: string[] }) => ({
        url: `/modules/course/${courseId}/reorder`,
        method: "POST",
        body: { moduleIds },
        credentials: "include",
      }),
      invalidatesTags: ["Modules"],
    }),
  }),
});

export const {
  useGetAllModulesQuery,
  useGetModuleByIdQuery,
  useGetModulesByCourseIdQuery,
  useGetAllCoursesWithModulesQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
  useReorderModulesMutation,
} = moduleApi;