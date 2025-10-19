"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClassesDropdownOpen, setIsClassesDropdownOpen] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check for MainSection intersection
      const mainSection =
        document.querySelector("main") ||
        document.getElementById("main-section");

      if (mainSection && navRef.current) {
        const navHeight = navRef.current.offsetHeight;
        const mainSectionTop = mainSection.getBoundingClientRect().top;

        // When MainSection is about to hit the navbar
        if (mainSectionTop <= navHeight && currentScrollY > lastScrollY) {
          setHideNavbar(true);
        } else if (currentScrollY < lastScrollY) {
          // Show navbar when scrolling up
          setHideNavbar(false);
        }
      } else {
        // Fallback to standard scroll direction logic if elements aren't found
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setHideNavbar(true);
        } else {
          setHideNavbar(false);
        }
      }

      // Update scroll position
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

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
      scale: 1.007,
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

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        when: "afterChildren",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.2,
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <motion.header
      ref={navRef}
      className="fixed top-0 left-0 w-full border-b border-gray-100 bg-white/90 backdrop-blur-sm z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: hideNavbar ? 0 : 1,
        y: hideNavbar ? -200 : 0,
      }}
      transition={{ duration: 0.3 }}
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
                className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full text-lg font-bold uppercase"
              >
                Home
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover="hover"
              className="relative group"
            >
              <Link
                href="/events/classes-workshops"
                className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full text-lg font-bold uppercase flex items-center gap-1"
              >
                Classes
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-200 group-hover:rotate-180"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </motion.svg>
              </Link>

              {/* Desktop Dropdown */}
              <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-2">
                  <Link
                    href="/events/classes-workshops"
                    className="block px-4 py-3 text-[#0f172a] hover:text-[#0369a1] hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Classes & Workshops
                  </Link>
                  <Link
                    href="/events/private-events"
                    className="block px-4 py-3 text-[#0f172a] hover:text-[#0369a1] hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Private Events
                  </Link>
                  <Link
                    href="/events/live-artist"
                    className="block px-4 py-3 text-[#0f172a] hover:text-[#0369a1] hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Live Artist Events
                  </Link>
                  <Link
                    href="/events/art-camps"
                    className="block px-4 py-3 text-[#0f172a] hover:text-[#0369a1] hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Art Camps
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/calendar"
                className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full text-lg font-bold uppercase"
              >
                Calendar
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/reservations"
                className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full text-lg font-bold uppercase"
              >
                Reservations
              </Link>
            </motion.div>
          </motion.nav>

          {/* Logo */}
          <div className="flex items-center relative">
            <motion.div
              className="relative w-48 h-32 md:w-96 -mt-2 -mb-5 ml-10 md:ml-0 md:h-56 md:-mt-2 md:-mb-5"
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
                className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full text-lg font-bold uppercase"
              >
                Gallery
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/about"
                className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full text-lg font-bold uppercase"
              >
                About
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/contact-us"
                className="nav-link text-[#0f172a] hover:text-[#0369a1] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full text-lg font-bold uppercase"
              >
                Contact
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
                    className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2 block uppercase"
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
                  <button
                    className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2 block w-full text-left flex items-center justify-between uppercase"
                    onClick={() =>
                      setIsClassesDropdownOpen(!isClassesDropdownOpen)
                    }
                  >
                    Classes
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animate={{ rotate: isClassesDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {isClassesDropdownOpen && (
                      <motion.div
                        className="ml-4 mt-2 overflow-hidden"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <motion.div variants={itemVariants} className="py-1">
                          <Link
                            href="/events/classes-workshops"
                            className="text-[#0f172a] hover:text-[#0369a1] font-normal py-1 block text-sm"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsClassesDropdownOpen(false);
                            }}
                          >
                            Classes & Workshops
                          </Link>
                        </motion.div>
                        <motion.div variants={itemVariants} className="py-1">
                          <Link
                            href="/events/private-events"
                            className="text-[#0f172a] hover:text-[#0369a1] font-normal py-1 block text-sm"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsClassesDropdownOpen(false);
                            }}
                          >
                            Private Events
                          </Link>
                        </motion.div>
                        <motion.div variants={itemVariants} className="py-1">
                          <Link
                            href="/events/live-artist"
                            className="text-[#0f172a] hover:text-[#0369a1] font-normal py-1 block text-sm"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsClassesDropdownOpen(false);
                            }}
                          >
                            Live Artist Events
                          </Link>
                        </motion.div>
                        <motion.div variants={itemVariants} className="py-1">
                          <Link
                            href="/events/art-camps"
                            className="text-[#0f172a] hover:text-[#0369a1] font-normal py-1 block text-sm"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsClassesDropdownOpen(false);
                            }}
                          >
                            Art Camps
                          </Link>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover="hover"
                  className="border-b border-gray-100 pb-2"
                >
                  <Link
                    href="/calendar"
                    className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2 block uppercase"
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
                    href="/reservations"
                    className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2 block uppercase"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Reservations
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants} whileHover="hover">
                  <Link
                    href="/about"
                    className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2 block uppercase"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants} whileHover="hover">
                  <Link
                    href="/contact-us"
                    className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2 block uppercase"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
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
