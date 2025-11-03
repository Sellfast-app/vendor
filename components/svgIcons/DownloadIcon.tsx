import * as React from "react";

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      strokeWidth="1.5"
      d="M8.999 9.75v6m0 0-3-3m3 3 3-3m-8.706-1.298A5.25 5.25 0 1 1 11.781 6h1.343a3.375 3.375 0 0 1 1.827 6.213"
    ></path>
  </svg>
);

export default DownloadIcon;