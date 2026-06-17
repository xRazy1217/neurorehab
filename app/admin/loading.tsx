import { PatientRowSkeleton } from '@/components/ui/Skeleton'

export default function AdminLoading() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="animate-pulse space-y-2">
          <div className="h-7 bg-gray-200 rounded-xl w-32" />
          <div className="h-4 bg-gray-100 rounded-xl w-48" />
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded-xl animate-pulse" />
      </div>
      <div className="h-12 bg-gray-100 rounded-xl mb-5 animate-pulse" />
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => <PatientRowSkeleton key={i} />)}
      </div>
    </div>
  )
}
