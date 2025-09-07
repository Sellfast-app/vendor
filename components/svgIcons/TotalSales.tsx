import * as React from "react";

const TotalSales: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 40 40"
  >
    <rect width="40" height="40" fill="#D4FFDD" rx="20"></rect>
    <path
      stroke="#247736"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.667"
      d="M20 11.667v16.667m4.167-14.167h-6.25a2.917 2.917 0 1 0 0 5.833h4.166a2.917 2.917 0 1 1 0 5.834H15"
    ></path>
  </svg>
);

export default TotalSales;
