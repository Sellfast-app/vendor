import * as React from "react";

const Withdrawal: React.FC<React.SVGProps<SVGSVGElement>> = ({color = "#061400"}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="15"
    fill="none"
    viewBox="0 0 18 15"
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M9 10.5H3A1.5 1.5 0 0 1 1.5 9V3A1.5 1.5 0 0 1 3 1.5h12A1.5 1.5 0 0 1 16.5 3v3.75m-3-.75h.008m.742 7.5V9m0 0 2.25 2.25M14.25 9 12 11.25M4.5 6h.008M10.5 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
    ></path>
  </svg>
);

export default Withdrawal;
