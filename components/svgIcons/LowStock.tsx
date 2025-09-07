import * as React from "react";

const LowStock: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 40 40"
  >
    <rect width="40" height="40" fill="#FFF9E1" rx="20"></rect>
    <path
      stroke="#E6B800"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.667"
      d="M20 17.5v3.333m0 3.334h.008m8.1.833-6.666-11.666a1.665 1.665 0 0 0-2.9 0L11.875 25a1.667 1.667 0 0 0 1.458 2.5h13.334a1.667 1.667 0 0 0 1.441-2.5"
    ></path>
  </svg>
);

export default LowStock;
