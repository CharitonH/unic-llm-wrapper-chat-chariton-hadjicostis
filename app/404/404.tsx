// pages/404.tsx

import { NextPage } from 'next';
import Link from 'next/link';
import React from 'react';

const Custom404: NextPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: '#f8f8f8',
        padding: '0 20px',
      }}
    >
      <h1 style={{ fontSize: '6rem', margin: 0 }}>404</h1>
      <h2 style={{ margin: '20px 0 10px' }}>Page Not Found</h2>
      <p style={{ margin: '0 0 30px' }}>
        Oops! The page you are looking for does not exist.
      </p>
      <Link href="/">
        <a
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Go Back Home!
        </a>
      </Link>
    </div>
  );
};

export default Custom404;