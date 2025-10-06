import * as React from "react";

const FlashIcon: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="25"
    fill="none"
    viewBox="0 0 24 25"
  >
    <rect width="24" height="24" y="0.5" fill="#E7F2FF" rx="8"></rect>
    <path
      stroke="#3B82F6"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.067"
      d="M6.667 13.833a.666.666 0 0 1-.52-1.086l6.6-6.8a.333.333 0 0 1 .573.306l-1.28 4.014a.667.667 0 0 0 .627.9h4.667a.666.666 0 0 1 .52 1.086l-6.6 6.8a.334.334 0 0 1-.574-.306l1.28-4.014a.667.667 0 0 0-.626-.9z"
    ></path>
  </svg>
);

export default FlashIcon;
