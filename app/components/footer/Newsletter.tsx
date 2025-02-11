"use client";

import { useState, useEffect, FormEvent } from "react";
import styles from "../../Footer.module.css";

export default function Newsletter() {
  const [email, setEmail] = useState<string>("");
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      return;
    }

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setEmail("");
      }
    } catch (error) {
      console.error("Failed to subscribe. Try again later.");
    }
  };

  return (
    <div className={styles.newsletterContainer}>
      <h1>Subscribe To Our Newsletter</h1>
      <p>Stay in touch with the latest news and releases</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        {isClient && (
          <div className={styles.subscribe} tabIndex={-1}>
            <input
              type="email"
              placeholder="YOUR E-MAIL"
              className={styles.input}
              autoComplete="off"
              spellCheck={false}
              aria-autocomplete="none"
              data-form-type="other"
              data-lpignore="true"
              readOnly
              onFocus={(e) => e.target.removeAttribute("readonly")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className={styles.subscribeBtn}>SUBSCRIBE</button>
          </div>
        )}
      </form>
    </div>
  );
}