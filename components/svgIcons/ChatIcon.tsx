import * as React from "react";

const ChatIcon: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
  >
    <g clipPath="url(#clip0_1797_253597)">
      <path
        stroke="#4FCA6A"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
        d="M15 6.75a1.5 1.5 0 0 1 1.5 1.5v7.714a.533.533 0 0 1-.909.377l-1.651-1.652a1.5 1.5 0 0 0-1.061-.439H7.5a1.5 1.5 0 0 1-1.5-1.5V12m6-4.5A1.5 1.5 0 0 1 10.5 9H5.121a1.5 1.5 0 0 0-1.06.44L2.409 11.09a.532.532 0 0 1-.909-.377V3A1.5 1.5 0 0 1 3 1.5h7.5A1.5 1.5 0 0 1 12 3z"
      ></path>
    </g>
    <defs>
      <clipPath id="clip0_1797_253597">
        <path fill="#fff" d="M0 0h18v18H0z"></path>
      </clipPath>
    </defs>
  </svg>
);

export default ChatIcon;
