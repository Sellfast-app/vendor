import * as React from "react";

const PendingDispatch: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 40 40"
  >
    <rect width="40" height="40" fill="#FFF4EB" rx="20"></rect>
    <path
      stroke="#FF8F2E"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.667"
      d="M18.333 11.667h3.334m-1.667 10v-3.334m-6.667 2.5A6.666 6.666 0 0 1 20 15a6.667 6.667 0 1 1-4.417 11.667l-2.25-2m4.167-.5h-4.167v4.166"
    ></path>
  </svg>
);

export default PendingDispatch;
