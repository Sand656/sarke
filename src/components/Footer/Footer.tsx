"use client";

import Link from "next/link";
import { RELEASES_URL, REPO_URL } from "@/config";
import { useLang } from "@/i18n/LangProvider";
import styles from "./Footer.module.css";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brandCol} data-reveal>
          <p className={styles.wordmark}>
            <span className={styles.square} aria-hidden="true" />
            SARKE
          </p>
          <p className="body">{t.footer.description}</p>
          <p className="label">{t.footer.meaning}</p>
        </div>

        <nav className={styles.col} aria-label={t.footer.links} data-reveal>
          <p className="label">{t.footer.links}</p>
          <ul className={styles.links}>
            <li>
              <a href={REPO_URL} className="u-link">{t.footer.github}</a>
            </li>
            <li>
              <a href={RELEASES_URL} className="u-link">{t.footer.releases}</a>
            </li>
            <li>
              <Link href="/docs" className="u-link">{t.footer.docs}</Link>
            </li>
          </ul>
        </nav>

        <div className={styles.col} data-reveal>
          <p className="label">{t.footer.team}</p>
          {/* TODO: team credits */}
          <p className={styles.todo}>{t.footer.teamTodo}</p>
          <p className="label">{t.footer.license}</p>
          {/* TODO: license */}
          <p className={styles.todo}>{t.footer.licenseTodo}</p>
        </div>
      </div>
    </footer>
  );
}
