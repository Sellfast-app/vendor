import * as React from "react";

const PendingGlass: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
  >
    <path
      stroke="#E76C00"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M3.75 16.5h10.5m-10.5-15h10.5m-1.5 15v-3.129a1.5 1.5 0 0 0-.44-1.06L9 9m0 0-3.31 3.31a1.5 1.5 0 0 0-.44 1.061V16.5M9 9 5.69 5.69a1.5 1.5 0 0 1-.44-1.061V1.5M9 9l3.31-3.31a1.5 1.5 0 0 0 .44-1.061V1.5"
    ></path>
  </svg>
);

export default PendingGlass;