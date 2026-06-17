import { CardSkeleton } from '@/components/ui/Skeleton'

export default function PatientLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header skeleton */}
      <div className="bg-primary px-5 pt-12 pb-6">
        <div className="animate-pulse space-y-2">
          <div className="h-7 bg-white/30 rounded-xl w-48" />
          <div className="h-4 bg-white/20 rounded-xl w-64" />
        </div>
      </div>
      <div className="flex-1 px-5 py-5 space-y-5">
        <CardSkeleton />
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 rounded-xl w-32 animate-pulse" />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}
