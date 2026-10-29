import type { DiagramSpec } from "@/lib/schema";
import type { Renderer } from "./kit";
import { influenzaRenderer } from "./influenza";
import { coronavirusRenderer } from "./coronavirus";
import { phageT4Renderer } from "./phageT4";
import { adenovirusRenderer } from "./adenovirus";
import { herpesvirusRenderer } from "./herpesvirus";
import { papillomavirusRenderer } from "./papillomavirus";
import { retrovirusRenderer } from "./retrovirus";
import { hepadnavirusRenderer } from "./hepadnavirus";
import { rotavirusRenderer } from "./rotavirus";
import { picornavirusRenderer } from "./picornavirus";
import { tobamovirusRenderer } from "./tobamovirus";
import { microvirusRenderer } from "./microvirus";

export const renderers: Record<DiagramSpec["renderer"], Renderer> = {
  influenza: influenzaRenderer,
  coronavirus: coronavirusRenderer,
  "phage-t4": phageT4Renderer,
  adenovirus: adenovirusRenderer,
  herpesvirus: herpesvirusRenderer,
  papillomavirus: papillomavirusRenderer,
  retrovirus: retrovirusRenderer,
  hepadnavirus: hepadnavirusRenderer,
  rotavirus: rotavirusRenderer,
  picornavirus: picornavirusRenderer,
  tobamovirus: tobamovirusRenderer,
  microvirus: microvirusRenderer,
};
