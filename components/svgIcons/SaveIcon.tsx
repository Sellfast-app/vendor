import * as React from "react";

const SaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M12.75 15.75V10.5a.75.75 0 0 0-.75-.75H6a.75.75 0 0 0-.75.75v5.25m0-13.5v3A.75.75 0 0 0 6 6h5.25m.15-3.75a1.5 1.5 0 0 1 1.05.45l2.85 2.85a1.5 1.5 0 0 1 .45 1.05v7.65a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V3.75a1.5 1.5 0 0 1 1.5-1.5z"
    ></path>
  </svg>
);

export default SaveIcon;
