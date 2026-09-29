import * as React from "react";

const StaffIcon: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }> = ({
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
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M9 16.5v-2.25a2.25 2.25 0 0 0-2.25-2.25H4.5A2.25 2.25 0 0 0 2.25 12V16.5"
    />
    <circle cx="4.5" cy="4.5" r="2.25" />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M15.75 16.5v-2.25a2.25 2.25 0 0 0-1.59-2.15M13.5 5.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
    />
  </svg>
);

export default StaffIcon;
