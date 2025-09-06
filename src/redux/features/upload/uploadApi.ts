/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../apiSlice/apiSlice";

export const uploadApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    uploadSingleImage: build.mutation({
      query: (formData: any) => ({
        url: "/uploads/image",
        method: "POST",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["Upload"],
    }),

    uploadMultipleImages: build.mutation({
      query: ({ formData, purpose }: { formData: any; purpose?: string }) => ({
        url: purpose ? `/uploads/images?purpose=${purpose}` : "/uploads/images",
        method: "POST",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["Upload"],
    }),

    uploadFile: build.mutation({
      query: (formData: any) => ({
        url: "/uploads/file",
        method: "POST",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["Upload"],
    }),

  
  }),
});

export const {
  useUploadSingleImageMutation,
  useUploadMultipleImagesMutation,
  useUploadFileMutation,
 
} = uploadApi;
