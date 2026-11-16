import type { ReactNode } from "react";
import styles from "./Button.module.css";

type Common = {
  children: ReactNode;
  variant?: "solid" | "ghost";
  onDark?: boolean;
  arrow?: boolean;
  className?: string;
};
type AsLink = Common & { href: string };
type AsButton = Common & { href?: undefined; type?: "button" | "submit"; onClick?: () => void };

/** The site's button. Pulls toward the cursor on desktop (data-magnetic). */
export default function Button(props: AsLink | AsButton) {
  const { children, variant = "solid", onDark, arrow, className } = props;
  const cls = [styles.btn, variant === "ghost" && styles.ghost, onDark && styles.onDark, className].filter(Boolean).join(" ");
  const content = (
    <>
      {children}
      {arrow && <span className={styles.arrow}>&rarr;</span>}
    </>
  );
  if (props.href !== undefined) {
    return (
      <a className={cls} href={props.href} data-magnetic="">
        {content}
      </a>
    );
  }
  return (
    <button className={cls} type={props.type ?? "button"} onClick={props.onClick} data-magnetic="">
      {content}
    </button>
  );
}
