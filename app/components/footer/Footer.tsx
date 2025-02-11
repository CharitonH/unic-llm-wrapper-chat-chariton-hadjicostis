"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../../Footer.module.css";
import Newsletter from "./Newsletter";

export default function Footer() {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className={styles.footer}>
      <Newsletter />

      <div className={styles.footerLinks}>
        <div className={styles.logoSection}>
          <div className={styles.logoContainer}>
            <Link href="#" className={styles.logo}>
              <Image src="/unic-logo-short-text.png" width={250} height={100} alt="Company Logo" className={styles.footerLogo} />
            </Link>
            {/* <p>Empowering businesses with innovative solutions for sustainable growth.</p> */}
          </div>
        </div>

        <div className={styles.linkSection}>
          <h4>Company</h4>
          <ul>
            <li><Link href="#">Dashboard</Link></li>
            <li><Link href="/properties">My Apps</Link></li>
            <li><Link href="#">App Store</Link></li>
            <li><Link href="#">Contact Us</Link></li>
          </ul>
        </div>

        <div className={styles.linkSection}>
          <h4>Resources</h4>
          <ul>
            <li><Link href="#">FAQs</Link></li>
            <li><Link href="#">Terms of Use</Link></li>
            <li><Link href="#">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className={styles.linkSection}>
          <h4>Account</h4>
          <ul>
            <li><Link href="#">Log In</Link></li>
            <li><Link href="#">Sign Up</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>&copy; {year} University of Nicosia - All Rights Reserved.</p>
      </div>
    </footer>
  );
}