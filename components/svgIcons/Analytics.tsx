import * as React from "react";

const Analytics: React.FC<React.SVGProps<SVGSVGElement>> = ({color="#061400",...props}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    {...props}
  >
    <g clipPath="url(#clip0_414_166515)">
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
        d="M15.907 11.918A7.5 7.5 0 1 1 6 2.123M15.75 9c.414 0 .754-.336.712-.748a7.5 7.5 0 0 0-6.714-6.713c-.413-.042-.749.298-.749.712v6a.75.75 0 0 0 .75.75z"
      ></path>
    </g>
    <defs>
      <clipPath id="clip0_414_166515">
        <path fill="#fff" d="M0 0h18v18H0z"></path>
      </clipPath>
    </defs>
  </svg>
);

export default Analytics;
