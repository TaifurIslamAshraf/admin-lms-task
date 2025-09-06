"use client"

import { IconTrendingDown, IconTrendingUp, IconBook, IconUsers, IconCertificate } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Import RTK Query hooks
import { useGetCardAnalyticsQuery } from "@/redux/features/dashboard/analyticsApi"

export function SectionCards() {
  // Use RTK Query hook for analytics data
  const {
    data: stats,
    isLoading: loading,
  } = useGetCardAnalyticsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    pollingInterval: 300000, // Poll every 5 minutes
  })

  if (loading) {
    return (
      <div className="w-full justify-between  grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-3 sm:px-4 lg:px-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="w-full min-h-[180px] sm:min-h-[200px]">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="h-3 sm:h-4 bg-muted animate-pulse rounded"></div>
              <div className="h-6 sm:h-8 bg-muted animate-pulse rounded mt-2"></div>
            </CardHeader>
            <CardFooter className="space-y-2 pt-0">
              <div className="h-3 sm:h-4 bg-muted animate-pulse rounded"></div>
              <div className="h-2 sm:h-3 bg-muted animate-pulse rounded w-3/4"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-3 sm:px-4 lg:px-6">
      <Card className="w-full min-h-[180px] sm:min-h-[200px] hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2 sm:pb-3">
          <CardDescription className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <IconBook className="size-3 sm:size-4 flex-shrink-0" />
            <span className="truncate">Total Courses</span>
          </CardDescription>
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-semibold tabular-nums leading-none">
            {stats?.totalCourses || 0}
          </CardTitle>
          <CardAction className="mt-1 sm:mt-2">
            <Badge variant="outline" className="text-green-600 text-xs">
              <IconTrendingUp className="size-2.5 sm:size-3" />
              +{stats?.courseTrend || 0}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 sm:gap-1.5 text-xs sm:text-sm pt-0">
          <div className="flex items-center gap-1.5 sm:gap-2 font-medium leading-tight">
            <span className="line-clamp-1">Course content growth</span>
            <IconTrendingUp className="size-3 sm:size-4 flex-shrink-0" />
          </div>
          <div className="text-muted-foreground text-xs leading-tight">
            Educational content metrics
          </div>
        </CardFooter>
      </Card>

      <Card className="w-full min-h-[180px] sm:min-h-[200px] hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2 sm:pb-3">
          <CardDescription className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <IconUsers className="size-3 sm:size-4 flex-shrink-0" />
            <span className="truncate">Total Students</span>
          </CardDescription>
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-semibold tabular-nums leading-none">
            {stats?.totalStudents || 0}
          </CardTitle>
          <CardAction className="mt-1 sm:mt-2">
            <Badge variant="outline" className={`text-xs ${stats && stats.studentTrend >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats && stats.studentTrend >= 0 ? <IconTrendingUp className="size-2.5 sm:size-3" /> : <IconTrendingDown className="size-2.5 sm:size-3" />}
              {stats && stats.studentTrend >= 0 ? "+" : ""}{stats?.studentTrend || 0}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 sm:gap-1.5 text-xs sm:text-sm pt-0">
          <div className="flex items-center gap-1.5 sm:gap-2 font-medium leading-tight">
            <span className="line-clamp-1">
              {stats && stats.studentTrend >= 0 ? "Growing student base" : "Student acquisition needs focus"}
            </span>
            {stats && stats.studentTrend >= 0 ? <IconTrendingUp className="size-3 sm:size-4 flex-shrink-0" /> : <IconTrendingDown className="size-3 sm:size-4 flex-shrink-0" />}
          </div>
          <div className="text-muted-foreground text-xs leading-tight">
            Platform learner activity
          </div>
        </CardFooter>
      </Card>

      <Card className="w-full min-h-[180px] sm:min-h-[200px] hover:shadow-md transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2 sm:pb-3">
          <CardDescription className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <IconCertificate className="size-3 sm:size-4 flex-shrink-0" />
            <span className="truncate">Active Enrollments</span>
          </CardDescription>
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-semibold tabular-nums leading-none">
            {stats?.enrolledCourses || 0}
          </CardTitle>
          <CardAction className="mt-1 sm:mt-2">
            <Badge variant="outline" className="text-green-600 text-xs">
              <IconTrendingUp className="size-2.5 sm:size-3" />
              +{stats?.enrollmentTrend || 0}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 sm:gap-1.5 text-xs sm:text-sm pt-0">
          <div className="flex items-center gap-1.5 sm:gap-2 font-medium leading-tight">
            <span className="line-clamp-1">Enrollment activity increasing</span>
            <IconTrendingUp className="size-3 sm:size-4 flex-shrink-0" />
          </div>
          <div className="text-muted-foreground text-xs leading-tight">
            Course participation trends
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}