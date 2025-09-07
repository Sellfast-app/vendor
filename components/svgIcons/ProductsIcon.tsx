import * as React from "react";

const ProductsIcon: React.FC<React.SVGProps<SVGElement>> = () => (
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
      d="M20 28.333V20m0 0-7.258-4.167M20 20l7.258-4.167M16.25 13.558l7.5 4.292m-4.583 10.258a1.67 1.67 0 0 0 1.666 0l5.834-3.333a1.67 1.67 0 0 0 .833-1.442v-6.666a1.67 1.67 0 0 0-.833-1.442l-5.834-3.333a1.67 1.67 0 0 0-1.666 0l-5.834 3.333a1.67 1.67 0 0 0-.833 1.442v6.666a1.67 1.67 0 0 0 .833 1.442z"
    ></path>
  </svg>
);

export default ProductsIcon;
