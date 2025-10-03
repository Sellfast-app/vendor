import * as React from "react";

const ArchiveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M3 6v8.25a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V6M7.5 9h3M2.25 2.25h13.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1-.75-.75V3a.75.75 0 0 1 .75-.75"
    ></path>
  </svg>
);

export default ArchiveIcon;
