"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import NavRippleText from "./NavRippleText";

interface OfferDropdownItem {
  href: string;
  label: string;
}

const OFFER_DROPDOWN_ITEMS: OfferDropdownItem[] = [
  { href: "/walk-in", label: "Walk Ins" },
  { href: "/events/classes-workshops", label: "Classes" },
  { href: "/events/private-events", label: "Private Events" },
  { href: "/reservations", label: "Reservations" },
];

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOfferDropdownOpen, setIsOfferDropdownOpen] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollYRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);

  useEffect(() => {
    const updateNavOffset = () => {
      if (!navRef.current || isMenuOpen) {
        return;
      }

      const navHeight = navRef.current.offsetHeight;
      document.documentElement.style.setProperty(
        "--nav-offset",
        `${navHeight}px`
      );
    };

    updateNavOffset();

    const resizeObserver = new ResizeObserver(() => {
      updateNavOffset();
    });

    if (navRef.current) {
      resizeObserver.observe(navRef.current);
    }

    window.addEventListener("resize", updateNavOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateNavOffset);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      setHideNavbar(false);
      return;
    }

    const handleScroll = () => {
      if (scrollRafRef.current !== null) {
        return;
      }

      scrollRafRef.current = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollYRef.current;
        const isNearTop = currentScrollY <= 32;
        const shouldHide = currentScrollY > 140 && scrollDelta > 6;
        const shouldShow = scrollDelta < -6 || isNearTop;

        if (shouldHide) {
          setHideNavbar((prevState) => (prevState ? prevState : true));
        } else if (shouldShow) {
          setHideNavbar((prevState) => (prevState ? false : prevState));
        }

        lastScrollYRef.current = currentScrollY;
        scrollRafRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, [isMenuOpen]);

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
        type: "spring" as const,
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
        type: "spring" as const,
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
      className={`fixed top-0 left-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-sm shadow-[0_2px_12px_rgba(15,23,42,0.06)] ${
        hideNavbar ? "pointer-events-none" : ""
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: hideNavbar ? 0 : 1,
        y: hideNavbar ? "-105%" : 0,
      }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between items-center py-1">
          {/* Logo (Left) */}
          <div className="flex items-center relative flex-shrink-0">
            <motion.div
              className="relative w-48 h-32 lg:w-52 lg:h-36 xl:w-60 xl:h-40 2xl:w-72 2xl:h-48 -mt-2 -mb-5"
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
            className="hidden lg:flex items-center lg:space-x-5 xl:space-x-8 2xl:space-x-10 h-full"
            variants={navVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/"
                className="nav-link text-[#0f172a] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full lg:text-sm xl:text-base 2xl:text-lg font-bold uppercase"
              >
                <NavRippleText text="Home" />
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover="hover"
              className="relative group"
            >
              <div className="nav-link text-[#0f172a] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full lg:text-sm xl:text-base 2xl:text-lg font-bold uppercase flex items-center gap-1 cursor-pointer">
                <NavRippleText text="What We Offer" />
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
              </div>

              {/* Desktop Dropdown */}
              <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-2">
                  {OFFER_DROPDOWN_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 text-[#0f172a] hover:text-[#0369a1] hover:bg-gray-50 transition-colors duration-200 font-medium"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/about"
                className="nav-link text-[#0f172a] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full lg:text-sm xl:text-base 2xl:text-lg font-bold uppercase"
              >
                <NavRippleText text="About" />
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/gallery"
                className="nav-link text-[#0f172a] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full lg:text-sm xl:text-base 2xl:text-lg font-bold uppercase"
              >
                <NavRippleText text="Gallery" />
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} whileHover="hover">
              <Link
                href="/contact-us"
                className="nav-link text-[#0f172a] relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#0369a1] after:transition-[width] after:duration-300 hover:after:w-full lg:text-sm xl:text-base 2xl:text-lg font-bold uppercase"
              >
                <NavRippleText text="Contact" />
              </Link>
            </motion.div>
          </motion.nav>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden flex items-center"
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
              className="lg:hidden pt-4 pb-2 overflow-hidden"
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
                      setIsOfferDropdownOpen(!isOfferDropdownOpen)
                    }
                  >
                    What We Offer
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
                      animate={{ rotate: isOfferDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {isOfferDropdownOpen && (
                      <motion.div
                        className="ml-4 mt-2 overflow-hidden"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        {OFFER_DROPDOWN_ITEMS.map((item) => (
                          <motion.div
                            key={item.href}
                            variants={itemVariants}
                            className="py-1"
                          >
                            <Link
                              href={item.href}
                              className="text-[#0f172a] hover:text-[#0369a1] py-1 block text-sm font-normal"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setIsOfferDropdownOpen(false);
                              }}
                            >
                              {item.label}
                            </Link>
                          </motion.div>
                        ))}
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
                    href="/about"
                    className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2 block uppercase"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover="hover"
                  className="border-b border-gray-100 pb-2"
                >
                  <Link
                    href="/gallery"
                    className="text-[#0f172a] hover:text-[#0369a1] font-medium py-2 block uppercase"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Gallery
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
