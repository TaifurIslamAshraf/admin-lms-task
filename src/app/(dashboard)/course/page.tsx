/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { IconPlus, IconSearch, IconTrash, IconEdit, IconEye, IconUsers, IconClock } from "@tabler/icons-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

// UI Components
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

// Import RTK Query hooks
import { useGetAllCoursesQuery, useDeleteCourseMutation } from "@/redux/features/dashboard/courseApi"
import Image from "next/image"
import NavHeader from "@/components/NavHeader"
import { breadEditCourse } from "@/lib/bread"

const CoursePage = () => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null)
  const limit = 12

  const { data, isLoading, error } = useGetAllCoursesQuery({
    page: currentPage,
    limit,
    search: searchTerm,
  })

  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation()

  const courses = data?.courses || []
  const pagination = data?.pagination || { total: 0, totalPages: 0 }

  const handleDeleteCourse = () => {
    if (!courseToDelete) return

    const { id, title } = courseToDelete

    // Move the actual deletion logic here
    deleteCourse(id).unwrap()
      .then(() => {
        toast.success("Course deleted successfully!", {
          description: `The course "${title}" has been deleted.`,
        })
        setIsDeleteDialogOpen(false)
        setCourseToDelete(null)
      })
      .catch((err: unknown) => {
        const errorMessage = err && typeof err === "object" && err !== null && "data" in err && err.data && typeof err.data === "object" && "message" in err.data
          ? (err.data as { message: string }).message
          : "Failed to delete course"
        toast.error("Failed to delete course", {
          description: errorMessage,
        })
      })
  }

  const openDeleteDialog = (courseId: string, courseTitle: string) => {
    setCourseToDelete({ id: courseId, title: courseTitle })
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setCourseToDelete(null)
  }

  return (
   <div>
    <NavHeader bread={breadEditCourse} />
     <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Course Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage all courses in your LMS platform
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" onClick={() => router.push("/course/create")}>
          <IconPlus className="w-4 h-4 mr-2" />
          Add New Course
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            All Courses
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            Published
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            Draft
          </Button>
        </div>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[4/3] bg-muted animate-pulse"></div>
              <CardContent className="p-3 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error loading courses
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            {error instanceof Error ? error.message : "Failed to fetch courses"}
          </p>
        </Card>
      ) : courses.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="text-muted-foreground text-lg mb-2">
            No courses found
          </div>
          <p className="text-sm text-muted-foreground">
            Get started by creating your first course
          </p>
          <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => router.push("/course/create")}>
            <IconPlus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {courses.map((course: any) => (
            <Card key={course._id} className="py-0 group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 overflow-hidden border-0 bg-card/50 backdrop-blur-sm">
              {/* Course Thumbnail */}
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 relative overflow-hidden">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    width={280}
                    height={210}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground/50">
                    📚
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs bg-background/90 backdrop-blur-sm">
                    {course.status || "Published"}
                  </Badge>
                </div>

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-background/90 hover:bg-background">
                      <IconEye className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-background/90 hover:bg-background" onClick={() => router.push(`/course/${course._id}`)}>
                      <IconEdit className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="destructive" className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-500" onClick={() => openDeleteDialog(course._id, course.title)} disabled={isDeleting}>
                      <IconTrash className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="px-3 pb-4">
                {/* Course Title */}
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                  {course.title}
                </h3>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <IconUsers className="w-3 h-3" />
                    <span>{course.enrolledStudents || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconClock className="w-3 h-3" />
                    <span>{course.duration || "Self-paced"}</span>
                  </div>
                </div>

                {/* Price and Level */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs px-2 py-0.5 h-5">
                    {course.level || "All Levels"}
                  </Badge>
                  <div className="font-bold text-sm text-primary">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </div>
                </div>

                {/* Instructor */}
                {course.instructor && (
                  <div className="text-xs text-muted-foreground truncate">
                    by {course.instructor}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="text-xs sm:text-sm"
          >
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(page => {
                const isWithinRange = Math.abs(page - currentPage) <= 2
                const isFirstLast = page === 1 || page === pagination.totalPages
                return isWithinRange || isFirstLast
              })
              .map((page, index, array: any) => (
                <div key={page}>
                  {index > 0 && array[index - 1] + 1 !== page && (
                    <span className="px-2 text-muted-foreground text-sm">...</span>
                  )}
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="text-xs sm:text-sm w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                </div>
              ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            disabled={currentPage === pagination.totalPages}
            className="text-xs sm:text-sm"
          >
            Next
          </Button>
        </div>
      )}

      {/* Summary Footer */}
      {courses.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs sm:text-sm text-muted-foreground border-t pt-4">
          <div>
            Showing {courses.length} of {pagination.total} courses
          </div>
          <div>
            Page {currentPage} of {pagination.totalPages}
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IconTrash className="w-5 h-5 text-destructive" />
              Delete Course
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the course <strong>"{courseToDelete?.title}"</strong>?
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                This action cannot be undone and will permanently remove the course and its content.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <IconTrash className="w-4 h-4 mr-2" />
                  Delete Course
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

export default CoursePage