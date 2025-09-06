/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { IconPlus, IconSearch, IconTrash, IconEdit, IconBook, IconBookmarks, IconChevronDown } from "@tabler/icons-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Import RTK Query hooks
import { useGetAllCoursesWithModulesAndLecturesQuery, useCreateLectureMutation, useUpdateLectureMutation, useDeleteLectureMutation, useAddPDFNoteMutation, useRemovePDFNoteMutation } from "@/redux/features/lecture/lectureApi"
import { useGetAllCoursesQuery } from "@/redux/features/dashboard/courseApi"
import { useUploadFileMutation } from "@/redux/features/upload/uploadApi"
import NavHeader from "@/components/NavHeader"
import { breadLeature } from "@/lib/bread"

// Zod schema for single lecture (for display/edit)
const singleLectureSchema = z.object({
  title: z.string().min(3, "Lecture title must be at least 3 characters"),
  videoUrl: z.string().url("Invalid video URL format").or(z.string().min(1, "Video URL is required")),
  pdfNotes: z.array(z.string()).optional(),
  order: z.number().min(1, "Order must be at least 1"),
  isActive: z.boolean().optional(),
})

// Zod schema for creating multiple lectures
const createLecturesSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  moduleId: z.string().min(1, "Module is required"),
  lectures: z.array(singleLectureSchema).min(1, "At least one lecture is required"),
})

// Zod schema for editing a single lecture
const editLectureSchema = z.object({
  title: z.string().min(3, "Lecture title must be at least 3 characters"),
  videoUrl: z.string().url("Invalid video URL format").or(z.string().min(1, "Video URL is required")),
  pdfNotes: z.array(z.string()).optional(),
  order: z.number().min(1, "Order must be at least 1"),
  isActive: z.boolean().optional(),
})

type CreateLecturesFormData = z.infer<typeof createLecturesSchema>
type EditLectureFormData = z.infer<typeof editLectureSchema>

const LecturePage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
  const [selectedLecture, setSelectedLecture] = useState<any | null>(null)
  const [lectureToDelete, setLectureToDelete] = useState<{ id: string; title: string } | null>(null)
  const [selectedLectureForFile, setSelectedLectureForFile] = useState<any | null>(null)

  // RTK Query hooks
  const { data, isLoading, error } = useGetAllCoursesWithModulesAndLecturesQuery({})

  const { data: coursesData } = useGetAllCoursesQuery({ page: 1, limit: 100 }) // Get all courses for dropdown
  const [createLecture, { isLoading: isCreating }] = useCreateLectureMutation()
  const [updateLecture, { isLoading: isUpdating }] = useUpdateLectureMutation()
  const [deleteLecture, { isLoading: isDeleting }] = useDeleteLectureMutation()
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
  const [addPDFNote] = useAddPDFNoteMutation()
  const [removePDFNote] = useRemovePDFNoteMutation()

  const coursesWithModulesAndLectures = data || []
  const courses = coursesData?.courses || []

  // Get modules for selected course
  const getModulesForCourse = (courseId: string) => {
    if (!courseId) return []
    const course = coursesWithModulesAndLectures.find((c: any) => c._id === courseId)
    return course?.modules || []
  }

  // Forms
  const createForm = useForm<CreateLecturesFormData>({
    resolver: zodResolver(createLecturesSchema),
    defaultValues: {
      courseId: "",
      moduleId: "",
      lectures: [{ title: "", videoUrl: "", pdfNotes: [], order: 1, isActive: true }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: createForm.control,
    name: "lectures"
  })

  // Watch course selection to update modules
  const currentCourseId = createForm.watch("courseId")
  const availableModules = getModulesForCourse(currentCourseId)

  const editForm = useForm<EditLectureFormData>({
    resolver: zodResolver(editLectureSchema),
    defaultValues: {
      title: "",
      videoUrl: "",
      pdfNotes: [],
      order: 1,
      isActive: true,
    },
  })

  const handleCreateLecture = async (data: CreateLecturesFormData) => {
    // Check if selected module exists
    const selectedCourse = courses.find((course: any) => course._id === data.courseId)

    if (!selectedCourse) {
      toast.error("Invalid module selected", {
        description: "Please select a valid course and module.",
      })
      return
    }

    try {
      // Create lectures one by one
      const promises = data.lectures.map(lecture =>
        createLecture({ ...lecture, courseId: data.courseId, moduleId: data.moduleId }).unwrap()
      )

      await Promise.all(promises)

      toast.success("Lectures created successfully!", {
        description: `Created ${data.lectures.length} lecture(s).`,
      })
      setIsCreateDialogOpen(false)
      createForm.reset()
    } catch (err: any) {
      toast.error("Failed to create lectures", {
        description: err?.data?.message
      })
      console.error("Lecture creation error:", err)
    }
  }

  const handleEditLecture = async (data: EditLectureFormData) => {
    if (!selectedLecture) return

    try {
      await updateLecture({
        id: selectedLecture._id,
        ...data
      }).unwrap()

      toast.success("Lecture updated successfully!", {
        description: `The lecture "${data.title}" has been updated.`,
      })
      setIsEditDialogOpen(false)
      setSelectedLecture(null)
      editForm.reset()
    } catch (err: unknown) {
      const errorMessage = err && typeof err === "object" && err !== null && "data" in err && err.data && typeof err.data === "object" && "message" in err.data
        ? (err.data as { message: string }).message
        : "Failed to update lecture"
      toast.error("Failed to update lecture", {
        description: errorMessage,
      })
    }
  }

  const openEditDialog = (lecture: any) => {
    setSelectedLecture(lecture)
    editForm.reset({
      title: lecture.title || "",
      videoUrl: lecture.videoUrl || "",
      pdfNotes: lecture.pdfNotes || [],
      order: lecture.order || 1,
      isActive: lecture.isActive ?? true,
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteLecture = async () => {
    if (!lectureToDelete) return

    const { id, title } = lectureToDelete

    try {
      await deleteLecture(id).unwrap()
      toast.success("Lecture deleted successfully!", {
        description: `The lecture "${title}" has been deleted.`,
      })
      setIsDeleteDialogOpen(false)
      setLectureToDelete(null)
    } catch (err: unknown) {
      const errorMessage = err && typeof err === "object" && err !== null && "data" in err && err.data && typeof err.data === "object" && "message" in err.data
        ? (err.data as { message: string }).message
        : "Failed to delete lecture"
      toast.error("Failed to delete lecture", {
        description: errorMessage,
      })
    }
  }

  const openDeleteDialog = (id: string, title: string) => {
    setLectureToDelete({ id, title })
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setLectureToDelete(null)
  }

  const openFileDialog = (lecture: any) => {
    setSelectedLectureForFile(lecture)
    setIsFileDialogOpen(true)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && selectedLectureForFile) {
      await handleAddPDF(selectedLectureForFile._id, file)
      setIsFileDialogOpen(false)
      setSelectedLectureForFile(null)
    }
  }

  // File upload handler
  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append("file", file)
  
      const result = await uploadFile(formData).unwrap()
      return result.data.path
    } catch (error: any) {
      toast.error("File upload failed", {
        description: error.message || "Failed to upload file",
      })
      return null
    }
  }

  // Add PDF to lecture
  const handleAddPDF = async (lectureId: string, file: File) => {
    const filePath = await handleFileUpload(file)
    if (filePath) {
      try {
        await addPDFNote({ id: lectureId, pdfPath: filePath }).unwrap()
        toast.success("PDF added successfully", {
          description: "The PDF has been added to the lecture.",
        })
      } catch (error: any) {
        toast.error("Failed to add PDF", {
          description: error.message || "Failed to add PDF to lecture",
        })
      }
    }
  }

  // Remove PDF from lecture
  const handleRemovePDF = async (lectureId: string, pdfPath: string) => {
    try {
      await removePDFNote({ id: lectureId, pdfPath }).unwrap()
      toast.success("PDF removed successfully", {
        description: "The PDF has been removed from the lecture.",
      })
    } catch (error: any) {
      toast.error("Failed to remove PDF", {
        description: error.message || "Failed to remove PDF from lecture",
      })
    }
  }

  const LectureCard = ({ course, onEditLecture, onDeleteLecture, onAddPDF, onRemovePDF, isUploading }: {
    course: any,
    onEditLecture: (lecture: any) => void,
    onDeleteLecture: (id: string, title: string) => void,
    onAddPDF: (lectureId: string, file: File) => void,
    onRemovePDF: (lectureId: string, pdfPath: string) => void,
    isUploading: boolean
  }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Filter lectures based on search term
    const filteredModules = course.modules?.filter((module: any) => {
      if (!searchTerm) return true
      return module.lectures?.some((lecture: any) =>
        lecture.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.videoUrl?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }) || []

    const getTotalLectures = () => {
      return filteredModules.reduce((total: number, module: any) => {
        return total + (module.lectures?.length || 0)
      }, 0)
    }

    const openFileDialog = (lecture: any) => {
      setSelectedLectureForFile(lecture)
      setIsFileDialogOpen(true)
    }

    return (
      <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <IconBook className="w-3 h-3" />
                      <span>{getTotalLectures()} lecture{getTotalLectures() !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                    {course.category || 'General'}
                  </Badge>
                  <IconChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </CardContent>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-4 border-t space-y-4">
              {/* Search within course */}
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search lectures in this course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {course.modules && course.modules.length > 0 ? (
                <>
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Modules & Lectures ({filteredModules.length} of {course.modules.length} modules)
                  </h4>
                  <div className="space-y-4">
                    {filteredModules.map((module: any, moduleIndex: number) => (
                      <div key={module._id} className="p-4 border rounded-lg bg-muted/30">
                        <h5 className="font-medium text-sm mb-3 text-foreground">
                          Module {moduleIndex + 1}: {module.title}
                        </h5>

                        <div className="space-y-2">
                          {module.lectures?.length > 0 ? (
                            module.lectures.map((lecture: any) => (
                              <div key={lecture._id} className="flex justify-between items-center p-2 border-l-2 border-muted bg-background rounded">
                                <div className="flex-1 min-w-0">
                                  <h6 className="font-medium text-sm">{lecture.title}</h6>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Order #{lecture.order}
                                    {lecture.isActive ? (
                                      <Badge variant="default" className="text-xs px-2 py-0 h-4 ml-2">Active</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs px-2 py-0 h-4 ml-2">Inactive</Badge>
                                    )}
                                  </div>
                                  {lecture.pdfNotes && lecture.pdfNotes.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {lecture.pdfNotes.map((pdf: string, pdfIndex: number) => (
                                        <div key={pdfIndex} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                                          <span className="truncate max-w-20 text-muted-foreground">
                                            {pdf.split('/').pop()}
                                          </span>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                            onClick={() => onRemovePDF(lecture._id, pdf)}
                                          >
                                            <IconTrash className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2"
                                    onClick={() => onEditLecture(lecture)}
                                  >
                                    <IconEdit className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2"
                                    onClick={() => onDeleteLecture(lecture._id, lecture.title)}
                                  >
                                    <IconTrash className="w-3 h-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-2 text-sm text-muted-foreground">
                              No lectures in this module yet.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No modules in this course yet.
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    )
  }

  return (
   <div>
    <NavHeader bread={breadLeature} />
     <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
            <IconBookmarks className="w-6 h-6" />
            Lecture Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage all lectures in your LMS platform
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <IconPlus className="w-4 h-4 mr-2" />
              Create Lecture
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IconPlus className="w-5 h-5" />
                Create New Lecture(s)
              </DialogTitle>
              <DialogDescription>
                Add multiple lectures to your LMS platform in one go
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateLecture)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          // Reset module selection when course changes
                          createForm.setValue("moduleId", "")
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map((course: any) => (
                            <SelectItem key={course._id} value={course._id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="moduleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Module</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a module" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableModules.map((module: any) => (
                            <SelectItem key={module._id} value={module._id}>
                              {module.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Lectures</h4>
                    <Button
                      type="button"
                      onClick={() => append({ title: "", videoUrl: "", pdfNotes: [], order: fields.length + 1, isActive: true })}
                      size="sm"
                    >
                      <IconPlus className="w-4 h-4 mr-2" />
                      Add Lecture
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <Collapsible key={field.id} defaultOpen={true}>
                      <CollapsibleTrigger asChild>
                        <div className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                          <h5 className="font-medium">Lecture {index + 1}</h5>
                          <div className="flex items-center gap-2">
                            <IconChevronDown className="w-4 h-4" />
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                remove(index)
                              }}
                              size="sm"
                              variant="outline"
                              disabled={fields.length === 1}
                            >
                              <IconTrash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 mt-2 pl-4 border-l-2 border-muted">
                        <FormField
                          control={createForm.control}
                          name={`lectures.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lecture Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter lecture title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name={`lectures.${index}.videoUrl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Video URL</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter YouTube or video URL" {...field} />
                              </FormControl>
                              <FormDescription>
                                Supports YouTube embeds and direct video URLs
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name={`lectures.${index}.pdfNotes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PDF Files</FormLabel>
                              <FormControl>
                                <Input
                                  type="file"
                                  multiple
                                  accept=".pdf"
                                  onChange={async (e) => {
                                    const files = Array.from(e.target.files || [])
                                    if (files.length > 0) {
                                      const filePaths: string[] = []
                                      for (const file of files) {
                                        const path = await handleFileUpload(file)
                                        if (path) {
                                          filePaths.push(path)
                                        }
                                      }
                                      field.onChange([...(field.value || []), ...filePaths])
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Upload PDF files for this lecture. The uploaded files will be available to students.
                              </FormDescription>
                              <FormMessage />
                              {field.value && field.value.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {field.value.map((pdf: string, pdfIndex: number) => (
                                    <div key={pdfIndex} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                                      <span className="truncate max-w-20 text-muted-foreground">
                                        {pdf.split('/').pop()}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={() => {
                                          const newPdfs = field?.value?.filter((_: string, idx: number) => idx !== pdfIndex)
                                          field.onChange(newPdfs)
                                        }}
                                      >
                                        <IconTrash className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name={`lectures.${index}.order`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Order</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormDescription>
                                The order of this lecture within the module (minimum 1)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name={`lectures.${index}.isActive`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Active Lecture</FormLabel>
                                <FormDescription>
                                  Make this lecture visible to students
                                </FormDescription>
                              </div>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormItem>
                          )}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false)
                      createForm.reset()
                    }}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <IconPlus className="w-4 h-4 mr-2" />
                        Create Lectures
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modules Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="bg-muted animate-pulse p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error loading lectures
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            {error instanceof Error ? error.message : "Failed to fetch lectures"}
          </p>
        </Card>
      ) : coursesWithModulesAndLectures.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="text-muted-foreground text-lg mb-2">
            No courses found
          </div>
          <p className="text-sm text-muted-foreground">
            Get started by creating your first lecture in a course module
          </p>
          <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => setIsCreateDialogOpen(true)}>
            <IconPlus className="w-4 h-4 mr-2" />
            Create Lecture
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {coursesWithModulesAndLectures.map((course: any) => (
            <LectureCard
              key={course._id}
              course={course}
              onEditLecture={openEditDialog}
              onDeleteLecture={openDeleteDialog}
              onAddPDF={handleAddPDF}
              onRemovePDF={handleRemovePDF}
              isUploading={isUploading}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconEdit className="w-5 h-5" />
              Edit Lecture
            </DialogTitle>
            <DialogDescription>
              Update lecture details below
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditLecture)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lecture Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter lecture title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter YouTube or video URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      Supports YouTube embeds and direct video URLs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="pdfNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PDF Files</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || [])
                          if (files.length > 0) {
                            const filePaths: string[] = []
                            for (const file of files) {
                              const path = await handleFileUpload(file)
                              if (path) {
                                filePaths.push(path)
                              }
                            }
                            field.onChange([...(field.value || []), ...filePaths])
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload additional PDF files for this lecture. The uploaded files will be added to existing PDFs.
                    </FormDescription>
                    <FormMessage />
                    {field.value && field.value.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {field.value.map((pdf: string, pdfIndex: number) => (
                          <div key={pdfIndex} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                            <span className="truncate max-w-20 text-muted-foreground">
                              {pdf.split('/').pop()}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => {
                                const newPdfs = field?.value?.filter((_: string, idx: number) => idx !== pdfIndex)
                                field.onChange(newPdfs)
                              }}
                            >
                              <IconTrash className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      The order of this lecture within the module (minimum 1)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Lecture</FormLabel>
                      <FormDescription>
                        Make this lecture visible to students
                      </FormDescription>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setSelectedLecture(null)
                    editForm.reset()
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <IconEdit className="w-4 h-4 mr-2" />
                      Update Lecture
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconPlus className="w-5 h-5" />
              Upload PDF
            </DialogTitle>
            <DialogDescription>
              Select a PDF file to add to lecture: {selectedLectureForFile?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                type="file"
                accept=".pdf"
                onChange={(event) => handleFileSelect(event)}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Only PDF files are allowed
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IconTrash className="w-5 h-5 text-destructive" />
              Delete Lecture
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the lecture <strong>{lectureToDelete?.title}</strong>?
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                This action cannot be undone and will permanently remove the lecture.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLecture} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <IconTrash className="w-4 h-4 mr-2" />
                  Delete Lecture
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
   </div>
  )
}

export default LecturePage