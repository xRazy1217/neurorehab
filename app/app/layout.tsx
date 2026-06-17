import BottomNav from '@/components/patient/BottomNav'
import InstallBanner from '@/components/ui/InstallBanner'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav />
      <InstallBanner />
    </div>
  )
}
