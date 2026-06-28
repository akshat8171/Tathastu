/**
 * app/blog/layout.tsx — Blog layout wrapper.
 *
 * Adds blog-specific styling context around all /blog/* routes.
 */

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {children}
      </div>
    </div>
  )
}
