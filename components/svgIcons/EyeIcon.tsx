import * as React from "react";

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M1.547 9.261a.75.75 0 0 1 0-.522 8.063 8.063 0 0 1 14.907 0 .75.75 0 0 1 0 .522 8.064 8.064 0 0 1-14.907 0"
    ></path>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M9 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5"
    ></path>
  </svg>
);

export default EyeIcon;
