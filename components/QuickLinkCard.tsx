import { ReactNode } from "react";

type QuickLinkCardProps = {
  title: string;
  subtitle: string;
  href: string;
  icon: ReactNode;
  colorClass: string;
};

export default function QuickLinkCard({
  title,
  subtitle,
  href,
  icon,
  colorClass,
}: QuickLinkCardProps) {
  return (
    <a
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className={`absolute inset-0 ${colorClass || "bg-black"}`} />

      <div className="relative z-10 flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-2">
          {icon}

          <div className="space-y-0.5">
            <h5 className="font-poly-sans-bulky text-[18px] font-bold leading-6 text-white">
              {title}
            </h5>
            <p className="font-inter text-[12px] font-semibold text-white/80">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}
