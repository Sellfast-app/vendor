import * as React from "react";

const Rating: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 40 40"
  >
    <rect width="40" height="40" fill="#FFE2F2" rx="20"></rect>
    <path
      stroke="#E8007C"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.667"
      d="M19.604 11.913a.442.442 0 0 1 .792 0l1.925 3.899a1.77 1.77 0 0 0 1.329.967l4.305.63a.441.441 0 0 1 .245.753l-3.113 3.032a1.77 1.77 0 0 0-.51 1.565l.735 4.283a.442.442 0 0 1-.642.467l-3.848-2.024a1.77 1.77 0 0 0-1.645 0L15.33 27.51a.443.443 0 0 1-.642-.467l.734-4.283a1.77 1.77 0 0 0-.509-1.565L11.8 18.163a.441.441 0 0 1 .245-.755l4.304-.63a1.77 1.77 0 0 0 1.331-.966z"
    ></path>
  </svg>
);

export default Rating;
