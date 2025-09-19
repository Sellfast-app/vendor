import * as React from "react";

const Map: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 40 40"
  >
    <rect width="40" height="40" fill="#FFF4EB" rx="20"></rect>
    <path
      stroke="#FFB347"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.667"
      d="M22.5 14.803c-.259 0-.514-.06-.745-.176l-3.51-1.755a1.7 1.7 0 0 0-.745-.175m5 2.106c.259 0 .514-.06.745-.176l3.05-1.525a.833.833 0 0 1 1.205.747v10.637a.83.83 0 0 1-.46.745l-3.795 1.897a1.67 1.67 0 0 1-1.49 0l-3.51-1.755a1.67 1.67 0 0 0-1.49 0l-3.05 1.525a.834.834 0 0 1-1.205-.747V15.515a.83.83 0 0 1 .46-.745l3.795-1.897c.231-.116.486-.176.745-.176m5 2.106v12.5m-5-14.606v12.5"
    ></path>
  </svg>
);

export default Map;
