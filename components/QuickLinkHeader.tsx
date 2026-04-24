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
          <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
        </svg>
      </div>

      <div className="min-w-0 space-y-0.5">
        <h5 className="font-poly-sans-bulky text-[18px] font-bold leading-6">
          Quick Links
        </h5>
        <p className="font-inter text-[12px] text-muted-foreground">
          Quick access to your essentials.
        </p>
      </div>
    </div>
  );
}
