import * as React from "react";

const Cancelcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    {...props}
  >
    <g clipPath="url(#clip0_590_174894)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
        d="m6.75 11.25 4.5-4.5M16.5 9a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0"
      ></path>
    </g>
    <defs>
      <clipPath id="clip0_590_174894">
        <path fill="#fff" d="M0 0h18v18H0z"></path>
      </clipPath>
    </defs>
  </svg>
);

export default Cancelcon;
