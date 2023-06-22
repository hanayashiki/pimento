import { VscGithubInverted } from "react-icons/vsc";

export const RelatedLinks = () => {
  return (
    <div className="flex gap-[1rem]">
      <a
        href="https://github.com/hanayashiki/pimento"
        target="_blank"
        title="Github Repository"
      >
        <VscGithubInverted />
      </a>

      <a
        href="https://plausible.monoid.co.jp/pimento.cwang.io"
        target="_blank"
        title="Site Traffic"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={16}
          height={16}
          fill="currentColor"
          viewBox="0 0 152 216"
        >
          <mask
            id="mask0_101:11"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="152"
            height="216"
          >
            <rect width="152" height="216" />
          </mask>
          <g mask="url(#mask0_101:11)">
            <circle cy="153" r="57" />
            <circle cx="75" cy="78" r="75" />
            <rect x="-2" y="71" width="54" height="77" />
          </g>
        </svg>
      </a>
    </div>
  );
};
