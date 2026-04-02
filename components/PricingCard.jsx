export default function PricingCard({ name, price, description, features, cta, ctaHref, highlighted }) {
  return (
    <div
      className={`relative rounded-2xl p-8 flex flex-col gap-6 ${
        highlighted
          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
          : 'bg-white border border-gray-200 text-gray-900'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}

      <div>
        <p className={`text-sm font-semibold uppercase tracking-wide ${highlighted ? 'text-indigo-200' : 'text-indigo-600'}`}>
          {name}
        </p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          {price !== 'Free' && (
            <span className={`text-sm ${highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>/month</span>
          )}
        </div>
        <p className={`mt-2 text-sm ${highlighted ? 'text-indigo-100' : 'text-gray-500'}`}>{description}</p>
      </div>

      <ul className="space-y-3 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <svg
              className={`w-4 h-4 mt-0.5 shrink-0 ${highlighted ? 'text-indigo-200' : 'text-indigo-500'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className={highlighted ? 'text-indigo-50' : 'text-gray-600'}>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={ctaHref}
        className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition ${
          highlighted
            ? 'bg-white text-indigo-600 hover:bg-indigo-50'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {cta}
      </a>
    </div>
  );
}
