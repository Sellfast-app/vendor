import * as React from "react";

const StoreIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    {...props}
  >
    <g clipPath="url(#clip0_1442_226926)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
        d="m1.5 5.25 3.308-3.307A1.5 1.5 0 0 1 5.872 1.5h6.256a1.5 1.5 0 0 1 1.065.442L16.5 5.25m-15 0h15m-15 0V7.5A1.5 1.5 0 0 0 3 9m13.5-3.75V7.5A1.5 1.5 0 0 1 15 9M3 9v6a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 15 15V9M3 9c.438-.024.857-.19 1.193-.473a.525.525 0 0 1 .615 0c.335.283.754.449 1.192.473.438-.024.857-.19 1.193-.473a.525.525 0 0 1 .615 0c.335.283.754.449 1.192.473.438-.024.857-.19 1.193-.473a.525.525 0 0 1 .614 0c.336.283.755.449 1.193.473.438-.024.857-.19 1.193-.473a.525.525 0 0 1 .614 0c.336.283.755.449 1.193.473m-3.75 7.5v-3a1.5 1.5 0 0 0-1.5-1.5h-1.5a1.5 1.5 0 0 0-1.5 1.5v3"
      ></path>
    </g>
    <defs>
      <clipPath id="clip0_1442_226926">
        <path fill="#fff" d="M0 0h18v18H0z"></path>
      </clipPath>
    </defs>
  </svg>
);

export default StoreIcon;
