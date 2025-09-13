import * as React from "react";

const MarkIcon: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
  >
    <g clipPath="url(#clip0_592_175434)">
      <path
        stroke="#061400"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
        d="M16.35 7.5a7.499 7.499 0 1 1-3.6-4.999m-6 5.749L9 10.5 16.5 3"
      ></path>
    </g>
    <defs>
      <clipPath id="clip0_592_175434">
        <path fill="#fff" d="M0 0h18v18H0z"></path>
      </clipPath>
    </defs>
  </svg>
);

export default MarkIcon;
