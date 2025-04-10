"use client";

import { useState } from "react";
import Link from "next/link";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="py-6 border-b border-gray-100">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0c4a6e] text-white text-lg font-bold">
              C
            </div>
            <h1 className="text-xl font-medium text-[#0c4a6e]">
              Coastal Creations Studio
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              href="/"
              className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full"
            >
              About
            </Link>
            <Link
              href="/classes"
              className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full"
            >
              Classes
            </Link>
            <Link
              href="/blog"
              className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full"
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full"
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#0c4a6e]"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#0c4a6e]"
              >
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 animate-[slideIn_0.3s_ease-out_forwards]">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/classes"
                className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Classes
              </Link>
              <Link
                href="/blog"
                className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
