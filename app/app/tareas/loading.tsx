import { TaskRowSkeleton } from '@/components/ui/Skeleton'

export default function TareasLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-primary px-5 pt-12 pb-5">
        <div className="animate-pulse space-y-2">
          <div className="h-7 bg-white/30 rounded-xl w-32" />
          <div className="h-4 bg-white/20 rounded-xl w-48" />
        </div>
      </div>
      <div className="flex-1 px-5 py-5 space-y-4">
        <div className="bg-surface rounded-xl p-1 flex shadow-card gap-1">
          <div className="flex-1 h-10 bg-gray-100 rounded-lg animate-pulse" />
          <div className="flex-1 h-10 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1,2,3,4].map(i => <TaskRowSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
