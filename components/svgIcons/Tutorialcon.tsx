import * as React from "react";

const Tutorialcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M10.001 5.833V17.5m0-11.667A3.333 3.333 0 0 0 6.668 2.5H2.501a.833.833 0 0 0-.833.833v10.834a.833.833 0 0 0 .833.833h5a2.5 2.5 0 0 1 2.5 2.5m0-11.667A3.333 3.333 0 0 1 13.335 2.5H17.5a.833.833 0 0 1 .834.833v10.834A.834.834 0 0 1 17.5 15h-5a2.5 2.5 0 0 0-2.5 2.5"
    ></path>
  </svg>
);

export default Tutorialcon;
