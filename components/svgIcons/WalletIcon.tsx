import { SVGProps } from "react";

export default function WalletIcon({
  color,
  ...rest
}: SVGProps<SVGSVGElement> & { color?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      {...rest}
    >
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M16 14a2 2 0 0 0-4 0" />
      <path d="M2 10h20" />
    </svg>
  );
}
