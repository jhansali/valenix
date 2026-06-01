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
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="valenix-mark" x1="11" x2="54" y1="10" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#13C8FF" />
          <stop offset="0.52" stopColor="#6D5CFF" />
          <stop offset="1" stopColor="#9B2BFF" />
        </linearGradient>
      </defs>
      <path
        d="M12 15h11.7c3 0 5.7 1.7 7.1 4.3L39 35.1l8.1-16c1.3-2.5 3.8-4.1 6.6-4.1H58L42.5 49H31.8L12 15Z"
        fill="url(#valenix-mark)"
      />
      <path
        d="M11 42.7c8.7 4 27.5-1.1 40.9-10.9"
        stroke="#8B35FF"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        d="M8.7 35.6c11.4-9.7 28-14.8 43.4-13.2"
        stroke="#1FC7FF"
        strokeLinecap="round"
        strokeOpacity="0.75"
        strokeWidth="2"
      />
      <path d="M39.6 7.5 42 13l5.7 2-5.7 2.1-2.4 5.5-2.4-5.5-5.7-2.1 5.7-2 2.4-5.5Z" fill="#7DD3FC" />
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
