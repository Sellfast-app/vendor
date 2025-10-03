import * as React from "react";

const CommunityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.4"
      d="M13.335 17.5v-1.667A3.333 3.333 0 0 0 10 12.5h-5a3.333 3.333 0 0 0-3.333 3.333V17.5M13.335 2.607a3.333 3.333 0 0 1 0 6.453m5 8.44v-1.667a3.33 3.33 0 0 0-2.5-3.225m-5-6.775a3.333 3.333 0 1 1-6.667 0 3.333 3.333 0 0 1 6.667 0"
    ></path>
  </svg>
);

export default CommunityIcon;
