import * as React from "react";

const PendingOrdersIcon: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 40 40"
  >
    <rect width="40" height="40" fill="#FFF9E1" rx="20"></rect>
    <g clipPath="url(#clip0_445_555636)">
      <path
        stroke="#E6B800"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.667"
        d="M20 11.667a8.333 8.333 0 0 1 6.15 13.958M20 15v5l3.333 1.667m-11.25-4.271a8.3 8.3 0 0 0-.416 2.5m.691 3.437a8.3 8.3 0 0 0 2.025 2.834m-.52-11.805q.349-.38.743-.714m2.597 14.202a8.33 8.33 0 0 0 6.36-.317"
      ></path>
    </g>
    <defs>
      <clipPath id="clip0_445_555636">
        <path fill="#fff" d="M10 10h20v20H10z"></path>
      </clipPath>
    </defs>
  </svg>
);

export default PendingOrdersIcon;
