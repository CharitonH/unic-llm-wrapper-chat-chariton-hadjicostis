"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import styles from "../../NavBar.module.css";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link id="unic-logo-menu" href="/" className={styles.logo}>
          <Image src="/UNIC-logo.webp" alt="Company Logo" width={250} height={100} priority />
        </Link>

        {/* Mobile Menu Button */}
        <button className={styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <span>&times;</span> : <span>&#9776;</span>}
        </button>

        {/* Navigation Links */}
        <ul className={`${styles.navMenu} ${isOpen ? styles.open : ""}`}>
          <li><Link href="/" className={styles.navItem}>Dashboard</Link></li>
          <li><Link href="/my-apps" className={styles.navItem}>My Apps</Link></li>
          <li><Link href="/app-store" className={styles.navItem}>App Store</Link></li>
          <li><Link href="/contactus" className={styles.navItem}>Contact Us</Link></li>

          {/* User Dropdown */}
          <li id="unic-user-profile" className="relative flex items-center space-x-1 md:ml-auto md:mr-0 mobile-center" >
            {/* style={{ right: 0, position: "absolute", marginRight: "20px !important" }} */}
            <div className="flex items-center md:space-x-1 w-full md:w-auto justify-center md:justify-start">
              {/* Smaller Avatar */}
              <button
                className="bg-teal-500 text-white w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                CH
              </button>

              {/* Arrow Icon (Unchanged) */}
              <button
                className="ml-1 md:ml-0"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <ChevronDown className="w-3 h-3 text-white" />
              </button>
            </div>

            {/* Dropdown Menu (Unchanged) */}
            {isDropdownOpen && (
              <div className="absolute left-1/2 md:left-auto md:right-0 transform -translate-x-1/2 md:translate-x-0 top-full mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                <ul className="py-2">
                  <li>
                    <Link
                      href="/"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/my-apps"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Apps
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/app-store"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      App Store
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}