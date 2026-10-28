import type { DiagramSpec } from "@/lib/schema";
import type { Renderer } from "./kit";
import { influenzaRenderer } from "./influenza";
import { coronavirusRenderer } from "./coronavirus";
import { phageT4Renderer } from "./phageT4";
import { adenovirusRenderer } from "./adenovirus";
import { herpesvirusRenderer } from "./herpesvirus";
import { papillomavirusRenderer } from "./papillomavirus";

export const renderers: Record<DiagramSpec["renderer"], Renderer> = {
  influenza: influenzaRenderer,
  coronavirus: coronavirusRenderer,
  "phage-t4": phageT4Renderer,
  adenovirus: adenovirusRenderer,
  herpesvirus: herpesvirusRenderer,
  papillomavirus: papillomavirusRenderer,
};
