'use client'; // Required for Next.js App Router (interactive elements)

import React, { FC } from 'react';
import Link from 'next/link';
import styles from './Page404.module.css';
import Image from "next/image";

const NotFound: FC = () => {
  return (
    <div className={styles.container}>
      <Link href="#" className={styles.logo}>
        <Image
          src="/unic-logo-short.png"
          width={250}
          height={100}
          alt="Company Logo"
          className={styles.footerLogo}
        />
      </Link>
      <h1 className={styles.oops}>Oops!</h1>
      <h2 className={styles.title}>404 - PAGE NOT FOUND</h2>
      <p className={styles.text}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p> <br/>
      {/* Link styled as a button */}
      <Link href="/" className={styles.button}>
        GO TO HOMEPAGE
      </Link>
    </div>
  );
};

export default NotFound;
