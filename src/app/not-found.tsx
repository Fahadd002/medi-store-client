// app/not-found.tsx
import Link from 'next/link'
import { Frown } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <Frown className="h-20 w-20 text-emerald-600 mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-emerald-600 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}