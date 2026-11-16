import type { ReactNode } from "react";
import { SHEETS } from "@/lib/content";
import { pad } from "@/lib/motion";
import styles from "./SectionHead.module.css";

type SheetProps = { sheet: number; label: string; dark?: boolean; className?: string };

/** "Sheet 02 / 07 · Parts list". Decodes like scrambled text when it scrolls into view. */
export function SheetLabel({ sheet, label, dark, className }: SheetProps) {
  return (
    <p className={["mono", styles.sheet, dark && styles.dark, className].filter(Boolean).join(" ")} data-scramble="">
      <b>Sheet {pad(sheet)}</b> / {pad(SHEETS)} &middot; {label}
    </p>
  );
}

type Props = { sheet: number; label: string; title: ReactNode; text: ReactNode; dark?: boolean };

export default function SectionHead({ sheet, label, title, text, dark }: Props) {
  return (
    <div className={[styles.head, dark && styles.dark].filter(Boolean).join(" ")}>
      <p className={["mono", styles.sheet].join(" ")} data-scramble="">
        <b>Sheet {pad(sheet)}</b> / {pad(SHEETS)} &middot; {label}
      </p>
      <h2 className="display" data-reveal="">{title}</h2>
      <p className={styles.text} data-reveal="">{text}</p>
    </div>
  );
}
