import type { Metadata } from "next";
import { sources } from "@/lib/data";
import { Tutor } from "@/components/Tutor";

export const metadata: Metadata = { title: "Tutor" };

export default function TutorPage() {
  return (
    <div className="container-atlas pt-12">
      <h1 className="display text-[42px] sm:text-[56px]">Ask the atlas</h1>
      <p className="mt-4 text-[18px] measure">
        Questions are answered only from the atlas&rsquo;s curated, cited material. With an AI key configured, a model writes an explanation and must cite
        the passages it used; without one, you get the matching curated passages directly. It does not give medical advice.
      </p>
      <div className="mt-10">
        <Tutor sources={sources} />
      </div>
    </div>
  );
}
