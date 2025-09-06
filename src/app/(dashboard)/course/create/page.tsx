"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { IconArrowLeft, IconBook, IconCamera, IconPlus, IconX } from "@tabler/icons-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

// Import RTK Query hooks
import { useCreateCourseMutation } from "@/redux/features/dashboard/courseApi"
import { useUploadSingleImageMutation } from "@/redux/features/upload/uploadApi"
import NavHeader from "@/components/NavHeader"
import { breadCreateCourse } from "@/lib/bread"

// Zod schema based on the validation schema from course.validation.ts
const createCourseSchema = z.object({
  title: z.string().min(3, "Course title must be at least 3 characters"),
  description: z.string().min(10, "Course description must be at least 10 characters"),
  price: z.number().min(0, "Price cannot be negative"),
  thumbnail: z.any().optional(), // Will be handled separately as file
})

type CreateCourseFormData = z.infer<typeof createCourseSchema>

const CreateCourse = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("")
  // isUploading state handled by mutation loading
  const fileInputRef = useRef<HTMLInputElement>(null)

  // RTK Query mutation hooks
  const [createCourse, { isLoading, error }] = useCreateCourseMutation()
  const [uploadSingleImage, { isLoading: isUploadingImage }] = useUploadSingleImageMutation()

  const form = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  })

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return

    const file = files[0]
    if (!file) return

    // Loading handled by mutation
    try {
      const formData = new FormData()
      formData.append("image", file)

      const result = await uploadSingleImage(formData).unwrap()

      if (result && result.data && result.data.url) {
        setThumbnailUrl(result.data.url)
        toast.success("Thumbnail uploaded successfully!")
      } else {
        toast.error("Upload failed", {
          description: "Invalid upload response"
        })
      }
    } catch (error: unknown) {
      console.error("Upload error:", error)
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "Unknown upload error"
      })
    } finally {
      // Loading handled by mutation
    }
  }

  const onSubmit = async (data: CreateCourseFormData) => {
    // Validate thumbnail is uploaded
    if (!thumbnailUrl) {
      toast.error("Thumbnail required", {
        description: "Please upload a thumbnail image before creating the course."
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Use the uploaded thumbnail URL
      const courseData = {
        ...data,
        thumbnail: thumbnailUrl,
      }

      await createCourse(courseData).unwrap()

      toast.success("Course created successfully!", {
        description: `The course "${data.title}" has been created.`,
      })

      router.push("/course")
    } catch (err: unknown) {
      const errorMessage = err && typeof err === "object" && err !== null && "data" in err && err.data && typeof err.data === "object" && "message" in err.data
        ? (err.data as { message: string }).message
        : "Failed to create course"
      toast.error("Failed to create course", {
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div>
      <NavHeader bread={breadCreateCourse} />
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
         
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
              <IconBook className="w-6 h-6" />
              Create New Course
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Add a new course to your LMS platform
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
            Fill in the details below to create your new course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title and Price Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Course Title
                        <Badge variant="secondary" className="text-xs">Required</Badge>
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
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                      <Badge variant="secondary" className="text-xs">Required</Badge>
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
                    <Badge variant="secondary" className="text-xs ml-2">Required</Badge>
                  </FormLabel>
                </div>

                {thumbnailUrl ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <Image
                        src={thumbnailUrl}
                        alt="Course Thumbnail"
                        width={400}
                        height={192}
                        className="max-w-full h-48 rounded-lg object-cover border"
                      />
                      <Button
                        onClick={() => setThumbnailUrl("")}
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      >
                        <IconX className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Thumbnail uploaded successfully! You can replace it below if needed.
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
                        <p className="text-sm text-muted-foreground">Uploading...</p>
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
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload([file])
                      e.target.value = ""
                    }
                  }}
                  className="hidden"
                  disabled={isUploadingImage}
                />
              </div>


              {/* Error Display */}
              {error && (
                <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <IconX className="w-5 h-5 text-red-500" />
                    <div className="text-sm text-red-700">
                      <p className="font-medium">Failed to create course</p>
                      <p>{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {(isLoading || isSubmitting) ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Course...
                    </>
                  ) : (
                    <>
                      <IconPlus className="w-4 h-4 mr-2" />
                      Create Course
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/course")}
                  disabled={isLoading || isSubmitting}
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
  )
}

export default CreateCourse