import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";
import { sources } from "@/lib/data";
import { Tutor } from "@/components/Tutor";

export const metadata: Metadata = { title: "Tutor" };

export default function TutorPage() {
  return (
    <div className="container-atlas pt-14">
      <SectionHead index="07 Tutor" title="Ask the atlas" />
      <p className="mt-6 text-[18px] measure">
        Questions are answered only from the atlas&rsquo;s curated, cited material. With an AI key configured, a model writes an explanation and must cite
        the passages it used; without one, you get the matching curated passages directly. It does not give medical advice.
      </p>
      <div className="mt-10">
        <Tutor sources={sources} />
      </div>
    </div>
  );
}
