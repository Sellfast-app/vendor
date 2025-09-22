import * as React from "react";

const EarningsIcon: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="41"
    height="40"
    fill="none"
    viewBox="0 0 41 40"
  >
    <rect width="40" height="40" x="0.333" fill="#D4FFDD" rx="20"></rect>
    <path
      stroke="#247736"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.667"
      d="M12.833 12.5v13.333A1.667 1.667 0 0 0 14.5 27.5h13.333m-1.666-10L22 21.667l-3.333-3.334-2.5 2.5"
    ></path>
  </svg>
);

export default EarningsIcon;
