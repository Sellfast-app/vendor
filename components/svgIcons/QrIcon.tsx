import * as React from "react";

const QrIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M15.75 12H13.5a1.5 1.5 0 0 0-1.5 1.5v2.25m3.75 0v.008M9 5.25V7.5A1.5 1.5 0 0 1 7.5 9H5.25m-3 0h.007M9 2.25h.008M9 12v.008M12 9h.75m3 0v.008M9 15.75V15M3 2.25h2.25A.75.75 0 0 1 6 3v2.25a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75V3A.75.75 0 0 1 3 2.25m9.75 0H15a.75.75 0 0 1 .75.75v2.25A.75.75 0 0 1 15 6h-2.25a.75.75 0 0 1-.75-.75V3a.75.75 0 0 1 .75-.75M3 12h2.25a.75.75 0 0 1 .75.75V15a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75v-2.25A.75.75 0 0 1 3 12"
    ></path>
  </svg>
);

export default QrIcon;
