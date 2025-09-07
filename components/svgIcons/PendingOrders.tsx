import * as React from "react";

const PendingOrders: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 40 40"
  >
    <rect width="40" height="40" fill="#FFF9E1" rx="20"></rect>
    <path
      stroke="#E6B800"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.667"
      d="M23.333 23.333h5m-2.5-2.5v5m1.667-7.5v-1.667a1.67 1.67 0 0 0-.833-1.441l-5.834-3.334a1.67 1.67 0 0 0-1.666 0l-5.834 3.334a1.67 1.67 0 0 0-.833 1.441v6.667a1.67 1.67 0 0 0 .833 1.442l5.834 3.333a1.67 1.67 0 0 0 1.666 0l1.667-.95m-6.25-13.6 7.5 4.292m-11.008-2.017L20 20m0 0 7.258-4.167M20 20v8.333"
    ></path>
  </svg>
);

export default PendingOrders;
