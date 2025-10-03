import * as React from "react";

const Emailcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="m18.335 5.833-7.493 4.773a1.67 1.67 0 0 1-1.674 0l-7.5-4.773m1.667-2.5h13.333c.92 0 1.667.746 1.667 1.667v10c0 .92-.747 1.667-1.667 1.667H3.335c-.92 0-1.667-.747-1.667-1.667V5c0-.92.746-1.667 1.667-1.667"
    ></path>
  </svg>
);

export default Emailcon;
