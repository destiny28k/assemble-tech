// Small client-side messages between sections.

/** The hero reports how many parts it drew, so the loader can count up to the real number. */
let partCount = 0;
export const setPartCount = (n: number) => {
  partCount = n;
};
export const getPartCount = () => partCount;

/** The configurator sends the chosen build to the contact form. */
export type BuildDetail = { services: string[]; message: string };
const BUILD_EVENT = "assemble:build";

export function sendBuild(detail: BuildDetail) {
  window.dispatchEvent(new CustomEvent<BuildDetail>(BUILD_EVENT, { detail }));
}

export function onBuild(fn: (detail: BuildDetail) => void): () => void {
  const handler = (e: Event) => fn((e as CustomEvent<BuildDetail>).detail);
  window.addEventListener(BUILD_EVENT, handler);
  return () => window.removeEventListener(BUILD_EVENT, handler);
}
