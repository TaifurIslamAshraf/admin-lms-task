/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  IconArrowLeft,
  IconBook,
  IconCamera,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";

// Import RTK Query hooks
import {
  useGetCourseByIdQuery,
  useUpdateCourseMutation,
} from "@/redux/features/dashboard/courseApi";
import { useUploadSingleImageMutation } from "@/redux/features/upload/uploadApi";
import { breadEditCourse } from "@/lib/bread";
import NavHeader from "@/components/NavHeader";

// Zod schema based on the validation schema
const updateCourseSchema = z.object({
  title: z.string().min(3, "Course title must be at least 3 characters"),
  description: z
    .string()
    .min(10, "Course description must be at least 10 characters"),
  price: z.number().min(0, "Price cannot be negative"),
  thumbnail: z.any().optional(),
});

type UpdateCourseFormData = z.infer<typeof updateCourseSchema>;

const EditCoursePage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.slug as string;

  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [newThumbnailUrl, setNewThumbnailUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RTK Query hooks
  const { data: course, isLoading: isCourseLoading } =
    useGetCourseByIdQuery(courseId);
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [uploadSingleImage, { isLoading: isUploadingImage }] =
    useUploadSingleImageMutation();

  const form = useForm<UpdateCourseFormData>({
    resolver: zodResolver(updateCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  });

  // Populate form when course data loads
  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title || "",
        description: course.description || "",
        price: course.price || 0,
      });
      setThumbnailUrl(course.thumbnail || "");
    }
  }, [course, form]);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    if (!file) return;

    // Loading handled by mutation
    try {
      const formData = new FormData();
      formData.append("image", file);

      const result = await uploadSingleImage(formData).unwrap();

      if (result && result.data && result.data.url) {
        setNewThumbnailUrl(result.data.url);
        toast.success("New thumbnail uploaded successfully!");
      } else {
        toast.error("Upload failed", {
          description: "Invalid upload response",
        });
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);
      toast.error("Upload failed", {
        description:
          error instanceof Error ? error.message : "Unknown upload error",
      });
    }
  };

  const currentThumbnailUrl = newThumbnailUrl || thumbnailUrl;

  const onSubmit = async (data: UpdateCourseFormData) => {
    try {
      const updateData: any = { ...data };
      if (newThumbnailUrl) {
        updateData.thumbnail = newThumbnailUrl;
      }

      await updateCourse({
        id: courseId,
        ...updateData,
      }).unwrap();

      toast.success("Course updated successfully!", {
        description: `The course "${data.title}" has been updated.`,
      });

      router.push("/course");
    } catch (err: unknown) {
      const errorMessage =
        err &&
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "message" in err.data
          ? (err.data as { message: string }).message
          : "Failed to update course";
      toast.error("Failed to update course", {
        description: errorMessage,
      });
    }
  };

  if (isCourseLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Course not found</h2>
          <p className="text-muted-foreground mb-4">
            The course you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Button onClick={() => router.push("/course")}>
            Back to Courses
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <NavHeader bread={breadEditCourse} />

      <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex  items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                <IconBook className="w-6 h-6" />
                Edit Course
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Update the course details below
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPlus className="w-5 h-5" />
              Course Details
            </CardTitle>
            <CardDescription>
              Fill in the details below to update your course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Title and Price Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Course Title
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter course title"
                            {...field}
                            className="text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Price (USD)
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            min="0"
                            step="0.01"
                            className="text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          Use 0 for free courses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Course Description
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your course content and objectives"
                          {...field}
                          className="min-h-[120px] text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Thumbnail Upload */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FormLabel>
                      Course Thumbnail
                      <Badge variant="secondary" className="text-xs ml-2">
                        Optional
                      </Badge>
                    </FormLabel>
                  </div>

                  {currentThumbnailUrl ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <Image
                          src={currentThumbnailUrl}
                          alt="Course Thumbnail"
                          width={400}
                          height={192}
                          className="max-w-full h-48 rounded-lg object-cover border"
                        />
                        <Button
                          onClick={() => {
                            setThumbnailUrl("");
                            setNewThumbnailUrl("");
                          }}
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        >
                          <IconX className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {newThumbnailUrl
                          ? "New thumbnail uploaded! Replace it below if needed."
                          : "Thumbnail loaded! Replace it below if needed."}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <IconCamera className="w-4 h-4 mr-2" />
                            Replace Thumbnail
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        isUploadingImage
                          ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                          : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      {isUploadingImage ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm text-muted-foreground">
                            Uploading...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <IconCamera className="w-12 h-12 mx-auto text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Upload course thumbnail
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Click to select or drag and drop an image
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Supported: JPG, PNG, WebP (max 4MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload([file]);
                        e.target.value = "";
                      }
                    }}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Updating Course...
                      </>
                    ) : (
                      <>
                        <IconPlus className="w-4 h-4 mr-2" />
                        Update Course
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/course")}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditCoursePage;
