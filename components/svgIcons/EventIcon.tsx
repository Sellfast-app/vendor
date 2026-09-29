import * as React from "react";

const EventIcon: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({
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
      x="2.25"
      y="3"
      width="13.5"
      height="12"
      rx="1.5"
    />
    <path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M2.25 7.5h13.5" />
    <path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M5.25 3v-1.5" />
    <path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12.75 3V1.5" />
    <path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M6.75 10.5h1.5v1.5H6.75Z" />
  </svg>
);

export default EventIcon;
