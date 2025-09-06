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
import { useGetAllCoursesWithModulesQuery, useCreateModuleMutation, useUpdateModuleMutation, useDeleteModuleMutation } from "@/redux/features/module/moduleApi"
import { useGetAllCoursesQuery } from "@/redux/features/dashboard/courseApi"
import NavHeader from "@/components/NavHeader"
import { breadModule } from "@/lib/bread"

// Zod schema for single module (for display/edit)
const singleModuleSchema = z.object({
  title: z.string().min(3, "Module title must be at least 3 characters"),
  moduleNumber: z.number().min(1, "Module number must be at least 1"),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
})

// Zod schema for creating multiple modules
const createModulesSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  modules: z.array(singleModuleSchema).min(1, "At least one module is required"),
})

// Zod schema for editing a single module
const editModuleSchema = z.object({
  title: z.string().min(3, "Module title must be at least 3 characters"),
  courseId: z.string().min(1, "Course is required"),
  moduleNumber: z.number().min(1, "Module number must be at least 1"),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
})

type CreateModulesFormData = z.infer<typeof createModulesSchema>
type EditModuleFormData = z.infer<typeof editModuleSchema>

const ModulePage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<any | null>(null)
  const [moduleToDelete, setModuleToDelete] = useState<{ id: string; title: string } | null>(null)

  // RTK Query hooks
  const { data, isLoading, error } = useGetAllCoursesWithModulesQuery({})

  const { data: coursesData } = useGetAllCoursesQuery({ page: 1, limit: 100 }) // Get all courses for dropdown
  const [createModule, { isLoading: isCreating }] = useCreateModuleMutation()


  const [updateModule, { isLoading: isUpdating }] = useUpdateModuleMutation()
  const [deleteModule, { isLoading: isDeleting }] = useDeleteModuleMutation()

  const coursesWithModules = data || []
  const courses = coursesData?.courses || []

  // Forms
  const createForm = useForm<CreateModulesFormData>({
    resolver: zodResolver(createModulesSchema),
    defaultValues: {
      courseId: "",
      modules: [{ title: "", moduleNumber: 1, isActive: true, description: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: createForm.control,
    name: "modules"
  })

  const editForm = useForm<EditModuleFormData>({
    resolver: zodResolver(editModuleSchema),
    defaultValues: {
      title: "",
      courseId: "",
      moduleNumber: 1,
      isActive: true,
      description: "",
    },
  })

  const handleCreateModule = async (data: CreateModulesFormData) => {
    // Check if selected course exists
    const selectedCourse = courses.find((course: any) => course._id === data.courseId)

    if (!selectedCourse) {
      toast.error("Invalid course selected", {
        description: "Please select a valid course from the dropdown.",
      })
      return
    }

    try {
      // Create modules one by one
      const promises = data.modules.map(module =>
        createModule({ ...module, courseId: data.courseId }).unwrap()
      )

      await Promise.all(promises)

      toast.success("Modules created successfully!", {
        description: `Created ${data.modules.length} module(s) for "${selectedCourse.title}".`,
      })
      setIsCreateDialogOpen(false)
      createForm.reset()
    } catch (err: any) {
      toast.error("Failed to create modules", {
        description: err?.data?.message
      })
      console.error("Module creation error:", err)
    }
  }

  const handleEditModule = async (data: EditModuleFormData) => {
    if (!selectedModule) return

    try {
      await updateModule({
        id: selectedModule._id,
        ...data
      }).unwrap()

      toast.success("Module updated successfully!", {
        description: `The module "${data.title}" has been updated.`,
      })
      setIsEditDialogOpen(false)
      setSelectedModule(null)
      editForm.reset()
    } catch (err: unknown) {
      const errorMessage = err && typeof err === "object" && err !== null && "data" in err && err.data && typeof err.data === "object" && "message" in err.data
        ? (err.data as { message: string }).message
        : "Failed to update module"
      toast.error("Failed to update module", {
        description: errorMessage,
      })
    }
  }

  const openEditDialog = (module: any) => {
    setSelectedModule(module)
    editForm.reset({
      title: module.title || "",
      courseId: module.courseId || "",
      moduleNumber: module.moduleNumber || 1,
      isActive: module.isActive ?? true,
      description: module.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteModule = async () => {
    if (!moduleToDelete) return

    const { id, title } = moduleToDelete

    try {
      await deleteModule(id).unwrap()
      toast.success("Module deleted successfully!", {
        description: `The module "${title}" has been deleted.`,
      })
      setIsDeleteDialogOpen(false)
      setModuleToDelete(null)
    } catch (err: unknown) {
      const errorMessage = err && typeof err === "object" && err !== null && "data" in err && err.data && typeof err.data === "object" && "message" in err.data
        ? (err.data as { message: string }).message
        : "Failed to delete module"
      toast.error("Failed to delete module", {
        description: errorMessage,
      })
    }
  }

  const openDeleteDialog = (id: string, title: string) => {
   setModuleToDelete({ id, title })
   setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
   setIsDeleteDialogOpen(false)
   setModuleToDelete(null)
  }

  const CourseCard = ({ course, onEditModule, onDeleteModule }: { course: any, onEditModule: (module: any) => void, onDeleteModule: (id: string, title: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Filter modules based on search term
    const filteredModules = course.modules?.filter((module: any) =>
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

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
                      <span>{course.modules?.length || 0} modules</span>
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
                  placeholder="Search modules in this course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Modules: ({searchTerm ? filteredModules.length : course.modules.length} of {course.modules.length})
                  </h4>
                  {filteredModules.length > 0 ? (
                    <div className="space-y-3">
                      {filteredModules.map((module: any) => (
                        <div key={module._id} className="flex justify-between items-center p-3 border rounded-lg bg-muted/30">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm">{module.title}</h5>
                            <div className="text-xs text-muted-foreground mt-1">
                              Module #{module.moduleNumber}
                              {module.isActive ? (
                                <Badge variant="default" className="text-xs px-2 py-0 h-4 ml-2">Active</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs px-2 py-0 h-4 ml-2">Inactive</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2"
                              onClick={() => onEditModule(module)}
                            >
                              <IconEdit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2"
                              onClick={() => onDeleteModule(module._id, module.title)}
                            >
                              <IconTrash className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchTerm ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No modules found matching "{searchTerm}".
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No modules in this course yet.
                    </div>
                  )}
                </div>
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

  const ModuleCard = ({ module, courses, onEdit, onDelete }: { module: any, courses: any[], onEdit: (module: any) => void, onDelete: (id: string, title: string) => void }) => {
   const [isOpen, setIsOpen] = useState(false)

   return (
     <Collapsible open={isOpen} onOpenChange={setIsOpen}>
       <Card className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
         <CollapsibleTrigger asChild>
           <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors space-y-3">
             <div className="flex justify-between items-start">
               <div className="flex-1 min-w-0">
                 <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem] mb-1">
                   {module.title}
                 </h3>
                 {module.courseId && (
                   <div className="text-xs text-muted-foreground">
                     <IconBook className="w-3 h-3 inline mr-1" />
                     {courses.find((c: any) => c._id === module.courseId)?.title || "Unknown Course"}
                   </div>
                 )}
               </div>
               <div className="flex items-center gap-2">
                 <Badge variant={module.isActive ? "default" : "outline"} className="text-xs px-2 py-0 h-5">
                   {module.isActive ? "Active" : "Inactive"}
                 </Badge>
                 <IconChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
               </div>
             </div>
           </CardContent>
         </CollapsibleTrigger>
         <CollapsibleContent>
           <CardContent className="p-4 border-t space-y-3">
             {/* Module Description */}
             <p className="text-xs text-muted-foreground line-clamp-3">
               {module.description || "No description available."}
             </p>

             {/* Module Stats */}
             <div className="flex items-center justify-between text-xs text-muted-foreground">
               <div className="flex items-center gap-1">
                 <IconBook className="w-3 h-3" />
                 <span>Module #{module.moduleNumber}</span>
               </div>
             </div>

             {/* Action Buttons */}
             <div className="flex gap-2 pt-2">
               <Button
                 size="sm"
                 variant="outline"
                 className="flex-1 h-8"
                 onClick={() => onEdit(module)}
               >
                 <IconEdit className="w-3 h-3 mr-1" />
                 Edit
               </Button>
               <Button
                 size="sm"
                 variant="outline"
                 className="flex-1 h-8"
                 onClick={() => onDelete(module._id, module.title)}
               >
                 <IconTrash className="w-3 h-3 mr-1" />
                 Delete
               </Button>
             </div>
           </CardContent>
         </CollapsibleContent>
       </Card>
     </Collapsible>
   )
 }

 return (
   <div>
    <NavHeader bread={breadModule} />
     <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
            <IconBookmarks className="w-6 h-6" />
            Module Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage all modules in your LMS platform
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <IconPlus className="w-4 h-4 mr-2" />
              Create Module
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IconPlus className="w-5 h-5" />
                Create New Module(s)
              </DialogTitle>
              <DialogDescription>
                Add multiple modules to your LMS platform in one go
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateModule)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Modules</h4>
                    <Button
                      type="button"
                      onClick={() => append({ title: "", moduleNumber: fields.length + 1, isActive: true, description: "" })}
                      size="sm"
                    >
                      <IconPlus className="w-4 h-4 mr-2" />
                      Add Module
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <Collapsible key={field.id} defaultOpen={true}>
                      <CollapsibleTrigger asChild>
                        <div className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                          <h5 className="font-medium">Module {index + 1}</h5>
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
                          name={`modules.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Module Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter module title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name={`modules.${index}.moduleNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Module Number</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormDescription>
                                The order of this module in the course (minimum 1)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name={`modules.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter module description (optional)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name={`modules.${index}.isActive`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Active Module</FormLabel>
                                <FormDescription>
                                  Make this module visible to students
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
                        Create Modules
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="bg-muted animate-pulse p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error loading modules
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            {error instanceof Error ? error.message : "Failed to fetch modules"}
          </p>
        </Card>
      ) : coursesWithModules.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="text-muted-foreground text-lg mb-2">
            No courses found
          </div>
          <p className="text-sm text-muted-foreground">
            Get started by creating your first module in a course
          </p>
          <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => setIsCreateDialogOpen(true)}>
            <IconPlus className="w-4 h-4 mr-2" />
            Create Module
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {coursesWithModules.map((course: any) => (
            <CourseCard
              key={course._id}
              course={course}
              onEditModule={openEditDialog}
              onDeleteModule={openDeleteDialog}
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
              Edit Module
            </DialogTitle>
            <DialogDescription>
              Update module details below
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditModule)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter module title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                control={editForm.control}
                name="moduleNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      The order of this module in the course (minimum 1)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter module description (optional)" {...field} />
                    </FormControl>
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
                      <FormLabel className="text-base">Active Module</FormLabel>
                      <FormDescription>
                        Make this module visible to students
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
                    setSelectedModule(null)
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
                      Update Module
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IconTrash className="w-5 h-5 text-destructive" />
              Delete Module
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the module <strong>{moduleToDelete?.title}</strong>?
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                This action cannot be undone and will permanently remove the module.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteModule} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <IconTrash className="w-4 h-4 mr-2" />
                  Delete Module
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

export default ModulePage