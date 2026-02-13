import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Hero from '@/components/landing/Hero'
import ValuePillars from '@/components/landing/ValuePillars'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/monuments')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <span className="font-semibold text-gray-900 text-sm">PatriAlta</span>
        </div>
      </nav>
      <Hero />
      <ValuePillars />
    </main>
  )
}
