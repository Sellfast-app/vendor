import * as React from "react";

const DeleteIcon: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
  >
    <path
      stroke="#E40101"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M7.5 8.25v4.5m3-4.5v4.5m3.75-8.25V15a1.5 1.5 0 0 1-1.5 1.5h-7.5a1.5 1.5 0 0 1-1.5-1.5V4.5m-1.5 0h13.5M6 4.5V3a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 12 3v1.5"
    ></path>
  </svg>
);

export default DeleteIcon;
