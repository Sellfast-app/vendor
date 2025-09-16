import * as React from "react";

const PreviewIcon: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
  >
    <path
      stroke="#061400"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M11.25 2.25h4.5m0 0v4.5m0-4.5L7.5 10.5m6-.75v4.5a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5h4.5"
    ></path>
  </svg>
);

export default PreviewIcon;
