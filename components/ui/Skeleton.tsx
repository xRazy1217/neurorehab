export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-surface rounded-card shadow-card p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

export function PatientRowSkeleton() {
  return (
    <div className="bg-surface rounded-card shadow-card p-4 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="w-12 h-6 rounded-full" />
    </div>
  )
}

export function TaskRowSkeleton() {
  return (
    <div className="bg-surface rounded-card shadow-card p-4 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
    </div>
  )
}
