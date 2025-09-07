import * as React from "react";

const TotalRevenue: React.FC<React.SVGProps<SVGElement>> = () => (
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
      d="M15 20h.008M25 20h.008m-11.675-5h13.334c.92 0 1.666.746 1.666 1.667v6.666c0 .92-.746 1.667-1.666 1.667H13.333c-.92 0-1.666-.746-1.666-1.667v-6.666c0-.92.746-1.667 1.666-1.667m8.334 5a1.667 1.667 0 1 1-3.334 0 1.667 1.667 0 0 1 3.334 0"
    ></path>
  </svg>
);

export default TotalRevenue;
