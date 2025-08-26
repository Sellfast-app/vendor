import * as React from "react";

const Products: React.FC<React.SVGProps<SVGSVGElement>> = ({color="#061400", ...props}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    {...props}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M9 16.5V9m0 0L2.467 5.25M9 9l6.533-3.75M5.625 3.203l6.75 3.863M8.25 16.298a1.5 1.5 0 0 0 1.5 0l5.25-3A1.5 1.5 0 0 0 15.75 12V6A1.5 1.5 0 0 0 15 4.703l-5.25-3a1.5 1.5 0 0 0-1.5 0l-5.25 3A1.5 1.5 0 0 0 2.25 6v6A1.5 1.5 0 0 0 3 13.298z"
    ></path>
  </svg>
);

export default Products;
