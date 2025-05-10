"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    hover: {
      scale: 1.05,
      x: 5,
      transition: { duration: 0.2 },
    },
  };

  const logoVariants = {
    initial: { scale: 0.9 },
    animate: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.5,
      },
    },
    hover: {
      scale: 1.05,
      rotate: 2,
      transition: { duration: 0.3 },
    },
  };

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        when: "beforeChildren",
      },
    },
  };

  return (
    <motion.header
      className="border-b border-gray-100"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center py-1">
          {/* Left Navigation */}
          <motion.nav
            className="hidden md:flex items-center justify-center space-x-10 h-full"
            variants={navVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/"
                className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full text-lg font-medium"
              >
                Home
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/classes"
                className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full text-lg font-medium"
              >
                Classes
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/calendar"
                className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full text-lg font-medium"
              >
                Calendar
              </Link>
            </motion.div>
          </motion.nav>

          {/* Logo */}
          <div className="flex items-center relative">
            <motion.div
              className="relative w-32 h-32 md:w-56 md:h-56 -mt-2 -mb-10 md:-mt-2 md:-mb-16"
              variants={logoVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <Link className="cursor-pointer" href="/">
                <Image
                  src="/assets/logos/coastalLogoFull.png"
                  alt="Coastal Creations Studio Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </Link>
            </motion.div>
          </div>

          {/* Right Navigation */}
          <motion.nav
            className="hidden md:flex items-center justify-center space-x-10 h-full"
            variants={navVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/gallery"
                className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full text-lg font-medium"
              >
                Gallery
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/blog"
                className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full text-lg font-medium"
              >
                Blog
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/about"
                className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full text-lg font-medium"
              >
                About
              </Link>
            </motion.div>
          </motion.nav>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden flex items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden pt-4 pb-2 overflow-hidden"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.nav
                className="flex flex-col space-y-4"
                variants={navVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  variants={itemVariants}
                  whileHover="hover"
                  className="border-b border-gray-100 pb-2"
                >
                  <Link
                    href="/"
                    className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2 block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover="hover"
                  className="border-b border-gray-100 pb-2"
                >
                  <Link
                    href="/classes"
                    className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2 block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Classes
                  </Link>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover="hover"
                  className="border-b border-gray-100 pb-2"
                >
                  <Link
                    href="/calendar"
                    className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2 block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Calendar
                  </Link>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover="hover"
                  className="border-b border-gray-100 pb-2"
                >
                  <Link
                    href="/blog"
                    className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2 block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Blog
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants} whileHover="hover">
                  <Link
                    href="/about"
                    className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2 block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                </motion.div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
