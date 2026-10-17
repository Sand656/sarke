import { CopyButton } from "@/components/CopyButton/CopyButton";
import styles from "./CodeBlock.module.css";

export function CodeBlock({ code, prompt = true }: { code: string; prompt?: boolean }) {
  return (
    <div className={styles.block}>
      <pre className={styles.pre} tabIndex={0}>
        <code>
          {prompt && (
            <span className={styles.prompt} aria-hidden="true">
              &gt;{" "}
            </span>
          )}
          {code}
        </code>
      </pre>
      <CopyButton value={code} />
    </div>
  );
}
