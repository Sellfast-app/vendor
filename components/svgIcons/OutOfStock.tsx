import * as React from "react";

const OutOfStock: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 40 40"
  >
    <rect width="40" height="40" fill="#FFE2E2" rx="20"></rect>
    <g clipPath="url(#clip0_346_172528)">
      <path
        stroke="#EB3232"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.667"
        d="M20 28.333v-7.5m6.667 0v3.225a1.72 1.72 0 0 1-.925 1.525l-5 2.567a1.61 1.61 0 0 1-1.484 0l-5-2.567a1.72 1.72 0 0 1-.925-1.525v-3.225m9.309-8.991a1.39 1.39 0 0 1 1.358 0l3.5 1.966a1.608 1.608 0 0 1 0 2.8l-10.15 5.717a1.38 1.38 0 0 1-1.367 0L12.5 20.358a1.61 1.61 0 0 1 0-2.8zm4.858 8.516a1.608 1.608 0 0 0 0-2.8l-10.142-5.725a1.37 1.37 0 0 0-1.358 0l-3.5 1.975a1.61 1.61 0 0 0 0 2.8l10.15 5.717a1.36 1.36 0 0 0 1.358 0z"
      ></path>
    </g>
    <defs>
      <clipPath id="clip0_346_172528">
        <path fill="#fff" d="M10 10h20v20H10z"></path>
      </clipPath>
    </defs>
  </svg>
);

export default OutOfStock;
