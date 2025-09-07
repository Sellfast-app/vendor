import * as React from "react";

const FulfilledOrders: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 40 40"
  >
    <rect width="40" height="40" fill="#FFF4EB" rx="20"></rect>
    <path
      stroke="#FF8F2E"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.667"
      d="M23.333 23.333 25 25l3.333-3.333m-.833-3.334v-1.666a1.67 1.67 0 0 0-.833-1.442l-5.834-3.333a1.67 1.67 0 0 0-1.666 0l-5.834 3.333a1.67 1.67 0 0 0-.833 1.442v6.666a1.67 1.67 0 0 0 .833 1.442l5.834 3.333a1.67 1.67 0 0 0 1.666 0l1.667-.95m-6.25-13.6 7.5 4.292m-11.008-2.017L20 20m0 0 7.258-4.167M20 20v8.333"
    ></path>
  </svg>
);

export default FulfilledOrders;
