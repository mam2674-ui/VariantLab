"use client";

import dynamic from "next/dynamic";
import { Component, useSyncExternalStore, type ReactNode } from "react";
import type { Virus3DProps } from "./Virus3D";

/** three.js loads only when a 3D view is actually shown. */
const Virus3D = dynamic(() => import("./Virus3D"), {
  ssr: false,
  loading: () => <p className="text-[14px] text-mute p-6">Loading 3D model…</p>,
});

let webgl: boolean | null = null;
export function hasWebGL(): boolean {
  if (webgl !== null) return webgl;
  try {
    const c = document.createElement("canvas");
    webgl = Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return webgl;
}
const noop = () => () => {};
/** false on the server, real answer in the browser — without a setState-in-effect round trip. */
export const useWebGL = () => useSyncExternalStore(noop, hasWebGL, () => false);

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** 3D with graceful fallback: no WebGL or a render error shows `fallback` (the 2D schematic). */
export function Lazy3D({ fallback, ...props }: Virus3DProps & { fallback: ReactNode }) {
  const ok = useWebGL();
  if (!ok) return <>{fallback}</>;
  return (
    <Boundary fallback={fallback}>
      <Virus3D {...props} />
    </Boundary>
  );
}
