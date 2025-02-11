"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FiClock, FiFolder, FiTrash2, FiGrid, FiDatabase, FiChevronDown, FiCircle } from "react-icons/fi";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(true); // Default to open
  const isMobile = windowWidth <= 768; // Detect mobile view

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close Library dropdown in mobile view
  useEffect(() => {
    if (isMobile) {
      setIsLibraryOpen(false);
    }
  }, [isMobile]);

  // Adjust sidebar width dynamically based on screen size
  const sidebarWidth =
    windowWidth > 1024 ? "w-72" : windowWidth > 768 ? "w-56" : "w-16";
  const hideText = windowWidth <= 768;

  return (
    <div
      className={`bg-[#202020] text-white flex flex-col min-h-screen p-4 ${sidebarWidth} overflow-y-auto transition-all duration-300 ${className} relative`}
    >
      {/* Absolute Container for Logo and New Chat Button */}
      <div className="absolute top-0 left-0 w-full bg-[#202020] px-4 pt-4 pb-2 z-10 flex flex-col items-center">
        {/* Logo */}
        {/* <Image
          src="/UNIC-logo.webp"
          alt="UNIC Logo"
          width={hideText ? 40 : 150}
          height={hideText ? 40 : 60}
          priority
        /> */}

        {/* New Chat Button */}
        <button
          className={`mt-2 bg-[#2BC5C1] w-full py-2 rounded-lg text-black flex items-center justify-center gap-2 transition-opacity duration-300 ${
            hideText ? "opacity-0" : "opacity-100"
          }`}
        >
          {!hideText && "+ New Chat"}
        </button>
      </div>

      {/* Main Menu - Pushed Down to Avoid Overlap */}
      <div className="mt-24 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-300">
          <FiClock size={20} /> {!hideText && <span>Recents</span>}
        </div>

        {/* Library Section - Toggleable */}
        <div className="flex flex-col text-gray-300">
          <button
            className="flex items-center gap-2 w-full text-left focus:outline-none"
            onClick={() => setIsLibraryOpen((prev) => !prev)}
          >
            <FiGrid size={20} />
            {!hideText && <span>Library</span>}
            {!hideText && (
              <FiChevronDown
                className={`ml-auto transition-transform ${
                  isLibraryOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {/* Library Items - Dropdown Below on Mobile */}
          {isLibraryOpen && (
            <div className={`mt-2 flex flex-col gap-2 ${isMobile ? "pl-0" : "pl-6"}`}>
              <div className="text-gray-400">Lists</div>
              <div className="text-gray-400">Personas</div>
              <div className="text-gray-400">Agents</div>
              <div className="text-gray-400">Projects</div>
              <div className="text-gray-400">Prompts</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <FiFolder size={20} /> {!hideText && <span>App Files</span>}
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <FiDatabase size={20} /> {!hideText && <span>Shared</span>}
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <FiTrash2 size={20} /> {!hideText && <span>Recently Deleted</span>}
        </div>
      </div>

      {/* Token Counter (remains at the bottom) */}
      <div
        className={`mt-auto bg-[#333] p-3 pb-14 rounded-lg text-sm text-gray-300 transition-opacity duration-300 relative ${
          hideText ? "hidden" : "block"
        }`}
      >
        {/* Token Info with Single Circle Icon */}
        <div className="flex items-center justify-between mb-1">
          <p>125,000 tokens left</p>
          <FiCircle size={18} className="text-gray-500" /> {/* Circle Icon */}
        </div>

        {/* Second line of text - aligned properly below */}
        <p className="text-xs text-gray-400">~145,000 words</p>

        {/* Button Wrapper: Push it down but keep it inside */}
        <div className="absolute left-0 right-0 bottom-0">
          <button className="w-full bg-[#555] text-white py-2 rounded-b-lg">
            See My Plan
          </button>
        </div>
      </div>
    </div>
  );
}
