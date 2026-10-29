/** Quiet index label over a geometric sans heading, inspired by the reference site. */
export function SectionHead({ index, title, as = "h1", id, size = "lg" }: { index: string; title: string; as?: "h1" | "h2"; id?: string; size?: "xl" | "lg" | "md" }) {
  const H = as;
  const cls = size === "xl" ? "text-[44px] sm:text-[72px] lg:text-[96px]" : size === "lg" ? "text-[38px] sm:text-[56px] lg:text-[68px]" : "text-[28px] sm:text-[36px]";
  return (
    <div>
      <p className="index-label mb-4">{index}</p>
      <H id={id} className={`display ${cls} max-w-[18ch]`}>
        {title}
      </H>
    </div>
  );
}
