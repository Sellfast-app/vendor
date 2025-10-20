import * as React from "react";

const ArrowLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="19"
    fill="none"
    viewBox="0 0 18 19"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M9 14.75 3.75 9.5m0 0L9 4.25M3.75 9.5h10.5"
    ></path>
  </svg>
);

export default ArrowLeft;