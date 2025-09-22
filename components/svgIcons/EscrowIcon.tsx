import * as React from "react";

const EscrowIcon: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="41"
    height="40"
    fill="none"
    viewBox="0 0 41 40"
  >
    <rect width="40" height="40" x="0.667" fill="#FFF4EB" rx="20"></rect>
    <path
      stroke="#FF8F2E"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.667"
      d="M15.667 20h.008m9.992 0h.008M14 15h13.333c.92 0 1.667.746 1.667 1.667v6.666c0 .92-.746 1.667-1.667 1.667H14c-.92 0-1.667-.746-1.667-1.667v-6.666c0-.92.747-1.667 1.667-1.667m8.333 5A1.667 1.667 0 1 1 19 20a1.667 1.667 0 0 1 3.333 0"
    ></path>
  </svg>
);

export default EscrowIcon;
