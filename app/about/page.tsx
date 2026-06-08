export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-display font-bold mb-8">
        About <span className="gradient-text">Layerix</span>
      </h1>

      <div className="space-y-8 text-lg leading-relaxed text-gray-300">
        <p>
          We believe that 3D printing is more than just technology—it&apos;s an
          art form. Every miniature, lamp, and sign we create is designed to be a
          centerpiece, a conversation starter, and a work of art.
        </p>

        <h2 className="font-display text-2xl font-bold text-white mt-12">
          Our Mission
        </h2>
        <p>
          If it exists, we can print it. Layer by layer, we bring imagination to
          life using cutting-edge 3D printing technology combined with hand-finishing
          by skilled artisans.
        </p>

        <h2 className="font-display text-2xl font-bold text-white mt-12">
          Our Values
        </h2>
        <ul className="space-y-4 list-disc list-inside text-gray-300">
          <li>
            <strong className="text-white">Precision:</strong> We never compromise on print
            quality or the materials we use.
          </li>
          <li>
            <strong className="text-white">Craftsmanship:</strong> Every piece is hand-finished
            and inspected before shipping.
          </li>
          <li>
            <strong className="text-white">Community:</strong> We&apos;re gamers and makers
            ourselves — we understand what you need.
          </li>
          <li>
            <strong className="text-white">Custom First:</strong> Your imagination is the only
            limit. We print what you dream.
          </li>
        </ul>
      </div>
    </div>
  )
}
