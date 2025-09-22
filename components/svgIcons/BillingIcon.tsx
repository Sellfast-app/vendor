import * as React from "react";

const BillingIcon: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 40 40"
  >
    <rect width="40" height="40" fill="#E2E8FF" rx="20"></rect>
    <path
      stroke="#2E54FF"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.667"
      d="M21.667 16.667h-5M23.333 20h-6.666m4.166 3.333h-4.166m-3.334-11.666v16.666L15 27.5l1.667.833 1.666-.833 1.667.833 1.667-.833 1.666.833L25 27.5l1.667.833V11.667L25 12.5l-1.667-.833-1.666.833L20 11.667l-1.667.833-1.666-.833L15 12.5z"
    ></path>
  </svg>
);

export default BillingIcon;
