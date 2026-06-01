import Link from "next/link";

type ValenixLogoProps = {
  href?: string;
  markOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: {
    mark: "h-6 w-6",
    text: "text-lg"
  },
  md: {
    mark: "h-8 w-8",
    text: "text-xl"
  },
  lg: {
    mark: "h-10 w-10",
    text: "text-2xl"
  }
};

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="valenix-mark" x1="12" x2="88" y1="10" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00D5FF" />
          <stop offset="0.56" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#FF4FD8" />
        </linearGradient>
        <filter id="valenix-mark-glow" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M50 86C26 66 12 45 12 26c0-16 16-18 26-4 10 14 12 34 12 34s2-20 12-34c10-14 26-12 26 4 0 19-14 40-38 60Z"
        filter="url(#valenix-mark-glow)"
        opacity="0.24"
        stroke="url(#valenix-mark)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="9"
      />
      <path
        d="M50 86C26 66 12 45 12 26c0-16 16-18 26-4 10 14 12 34 12 34s2-20 12-34c10-14 26-12 26 4 0 19-14 40-38 60Z"
        stroke="url(#valenix-mark)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7"
      />
      <path
        d="M38 22c7 10 10 22 12 34 2-12 5-24 12-34"
        stroke="url(#valenix-mark)"
        strokeLinecap="round"
        strokeDasharray="5 5"
        strokeOpacity="0.76"
        strokeWidth="4.4"
      />
      <circle cx="50" cy="25" fill="#00D5FF" r="4.8" />
      <path d="m72 8 2.5 5.9 6 2.1-6 2.2L72 24l-2.6-5.8-6-2.2 6-2.1L72 8Z" fill="#FF4FD8" />
    </svg>
  );
}

export function ValenixLogo({ href, markOnly = false, size = "sm", className = "" }: ValenixLogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight text-ink ${className}`}>
      <LogoMark className={sizeClasses[size].mark} />
      {markOnly ? <span className="sr-only">Valenix</span> : <span className={sizeClasses[size].text}>Valenix</span>}
    </span>
  );

  if (!href) return content;

  return (
    <Link aria-label="Valenix home" href={href}>
      {content}
    </Link>
  );
}
