import * as React from "react";

const MessageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M9 2.25H3a1.5 1.5 0 0 0-1.5 1.5v12.215a.533.533 0 0 0 .909.376l1.652-1.652a1.5 1.5 0 0 1 1.06-.439H15a1.5 1.5 0 0 0 1.5-1.5v-3M12 2.25h4.5m0 0v4.5m0-4.5L12 6.75"
    ></path>
  </svg>
);

export default MessageIcon;
