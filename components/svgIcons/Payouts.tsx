import * as React from "react";

const Payouts: React.FC<React.SVGProps<SVGSVGElement>> = ({color="#061400",...props}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    {...props}
  >
    <g clipPath="url(#clip0_414_166519)">
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
        d="M8.25 11.25h1.5a1.5 1.5 0 1 0 0-3H7.5c-.45 0-.825.15-1.05.45l-4.2 4.05m3 3 1.2-1.05c.225-.3.6-.45 1.05-.45h3c.825 0 1.575-.3 2.1-.9l3.45-3.3a1.502 1.502 0 0 0-2.062-2.182l-3.15 2.925M1.5 12 6 16.5m8.175-9.75a2.175 2.175 0 1 1-4.35 0 2.175 2.175 0 0 1 4.35 0m-7.425-3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0"
      ></path>
    </g>
    <defs>
      <clipPath id="clip0_414_166519">
        <path fill="#fff" d="M0 0h18v18H0z"></path>
      </clipPath>
    </defs>
  </svg>
);

export default Payouts;
