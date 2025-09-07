import * as React from "react";

const TotalOrders: React.FC<React.SVGProps<SVGElement>> = () => (
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
      d="M23.333 18.334a3.333 3.333 0 0 1-6.666 0m-4.081-3.305h14.828m-14.58-.473c-.217.289-.334.64-.334 1v11.111a1.667 1.667 0 0 0 1.667 1.667h11.666a1.666 1.666 0 0 0 1.667-1.667v-11.11c0-.362-.117-.712-.333-1L25.5 12.333a1.67 1.67 0 0 0-1.333-.667h-8.334a1.67 1.67 0 0 0-1.333.667z"
    ></path>
  </svg>
);

export default TotalOrders;
