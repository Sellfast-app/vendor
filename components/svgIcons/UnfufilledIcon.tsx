import * as React from "react";

const UnfufilledIcon: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
  >
    <g clipPath="url(#clip0_662_182948)">
      <path
        stroke="#E80000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
        d="M9 1.5a7.5 7.5 0 0 1 5.535 12.563M9 4.5V9l3 1.5M1.875 6.656a7.5 7.5 0 0 0-.375 2.25M2.122 12a7.5 7.5 0 0 0 1.823 2.55M3.477 3.926a8 8 0 0 1 .668-.643m2.338 12.782a7.5 7.5 0 0 0 5.723-.285"
      ></path>
    </g>
    <defs>
      <clipPath id="clip0_662_182948">
        <path fill="#fff" d="M0 0h18v18H0z"></path>
      </clipPath>
    </defs>
  </svg>
);

export default UnfufilledIcon;