export type Service = { no: string; title: string; text: string; tags: string[] };

/** A tool on the "Untangle" board: how it looks today and the module it becomes. */
export type ToolCard = {
  type: string;
  title: string;
  tone: string;
  warn?: boolean;
  module: string;
  core?: boolean;
  /** Scattered position and tilt, in percent of the board and degrees. */
  chaos: [number, number, number];
  /** Position in the assembled grid, in percent of the board. */
  order: [number, number];
};

export type Step = { time: string; title: string; text: string; command: string; result: string };
export type Commitment = { value: string; count?: number; decimals?: number; suffix?: string; label: string };

/** A part in the configurator. `service` is the contact form option it maps to. */
export type BuildPart = { id: string; no: string; name: string; weeks: number; service: string; group: string };
export type ServiceOption = { id: string; label: string };
