import Image from "next/image";

interface FlagProps {
  countryCode: string;
  size?: number;
  className?: string;
}

// flagcdn.com only supports these widths
const VALID_SIZES = [20, 40, 80, 160, 320, 640] as const;

function nearestSize(size: number): number {
  return VALID_SIZES.reduce((prev, curr) =>
    Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
  );
}

export function Flag({ countryCode, size = 32, className = "" }: FlagProps) {
  const code = countryCode.toLowerCase();
  const cdnSize = nearestSize(size);
  return (
    <Image
      src={`https://flagcdn.com/w${cdnSize}/${code}.png`}
      width={size}
      height={Math.round(size / 1.5)}
      alt={countryCode}
      className={`rounded-sm object-cover ${className}`}
      unoptimized
    />
  );
}
