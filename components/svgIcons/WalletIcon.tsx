import * as React from "react";

const WalletIcon: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({
  color = "#061400",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    {...props}
  >
    <rect
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      x="2"
      y="4"
      width="14"
      height="10"
      rx="2"
    />
    <path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
    <path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M2 10h14" />
  </svg>
);

export default WalletIcon;
