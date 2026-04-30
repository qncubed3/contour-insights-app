export default function QuickLinkHeader() {
  return (
    <div className="flex min-w-0 items-center gap-3 p-6 pb-0">
      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 bg-brand-orange/10 text-brand-orange rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <line x1="12" x2="12" y1="20" y2="10" />
          <line x1="18" x2="18" y1="20" y2="4" />
          <line x1="6" x2="6" y1="20" y2="16" />
        </svg>
      </div>

      <div className="min-w-0 space-y-0.5">
        <h5 className="font-poly-sans-bulky text-[18px] font-bold leading-6">
          Data Products
        </h5>
        <p className="font-inter text-[12px] text-muted-foreground">
          Explore data and insights across Contour
        </p>
      </div>
    </div>
  );
}
