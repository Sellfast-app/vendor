import * as React from "react";

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M9 2.25H3.75a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V9M13.781 1.97a1.591 1.591 0 0 1 2.25 2.25l-6.76 6.76a1.5 1.5 0 0 1-.64.38l-2.154.63a.375.375 0 0 1-.465-.466l.63-2.155a1.5 1.5 0 0 1 .38-.639z"
    ></path>
  </svg>
);

export default EditIcon;
