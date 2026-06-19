type SectionDividerProps = {
  /** CSS color (e.g. #ffffff, #ecfdf5) for the wave so it matches the next section. */
  bottomFill?: string;
};

export default function SectionDivider({ bottomFill = '#ffffff' }: SectionDividerProps) {
  return (
    <div className="w-full h-8 -mb-px flex-shrink-0" aria-hidden>
      <svg
        className="w-full h-full block"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,70 C360,110 720,30 1440,70 L1440,120 L0,120 Z"
          fill={bottomFill}
        />
      </svg>
    </div>
  );
}