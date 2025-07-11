"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // Icons for mobile menu
import { gsap } from "gsap";

interface NavbarProps {
  variant?: "transparent" | "primary";
}

const Navbar: React.FC<NavbarProps> = ({ variant = "transparent" }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navItemElementsRef = useRef<Array<HTMLAnchorElement | null>>([]);
  const menuButtonRef = useRef<HTMLButtonElement>(null); // Ref for the menu button
  const menuIconWrapperRef = useRef<HTMLDivElement>(null); // Ref for Menu icon wrapper
  const xIconWrapperRef = useRef<HTMLDivElement>(null); // Ref for X icon wrapper

  useEffect(() => {
    // Initial load animations for desktop and main logo
    gsap.from(".logo-text", {
      duration: 0.7,
      opacity: 0,
      x: -30,
      ease: "power3.out",
      delay: 0.2,
    });
    gsap.from(".nav-item-desktop", {
      duration: 0.5,
      opacity: 0,
      y: -20,
      stagger: 0.1,
      ease: "power3.out",
      delay: 0.4,
    });
    gsap.from(".cta-button-desktop", {
      duration: 0.7,
      opacity: 0,
      x: 30,
      ease: "power3.out",
      delay: 0.4,
    });

    // Initial state for mobile menu icons
    if (menuIconWrapperRef.current && xIconWrapperRef.current) {
      gsap.set(menuIconWrapperRef.current, {
        display: "inline-block",
        opacity: 1,
        scale: 1,
        rotation: 0,
      });
      gsap.set(xIconWrapperRef.current, {
        display: "none",
        opacity: 0,
        scale: 0.7,
        rotation: 45,
      });
    }
  }, []);

  useEffect(() => {
    const currentNavItems = navItemElementsRef.current.filter(
      (el) => el !== null
    ) as HTMLElement[];
    const drawerEl = mobileMenuRef.current;
    const menuIconEl = menuIconWrapperRef.current;
    const xIconEl = xIconWrapperRef.current;

    if (!drawerEl || !menuIconEl || !xIconEl) return;

    if (isMobileMenuOpen) {
      gsap.set(drawerEl, { display: "flex" }); // display: flex for flex-col layout of drawer
      gsap.to(drawerEl, {
        duration: 0.4,
        height: "auto",
        opacity: 1,
        ease: "power3.out",
      });
      gsap.fromTo(
        currentNavItems,
        { opacity: 0, y: 20 },
        {
          duration: 0.3,
          opacity: 1,
          y: 0,
          stagger: 0.07,
          ease: "power3.out",
          delay: 0.1,
        }
      );

      gsap
        .timeline()
        .to(menuIconEl, {
          duration: 0.2,
          opacity: 0,
          scale: 0.7,
          rotation: -45,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(menuIconEl, { display: "none" });
          },
        })
        .set(
          xIconEl,
          { display: "inline-block", opacity: 0, scale: 0.7, rotation: 45 },
          "+=0.05"
        )
        .to(xIconEl, {
          duration: 0.2,
          opacity: 1,
          scale: 1,
          rotation: 0,
          ease: "power2.out",
        });
    } else {
      gsap.to(currentNavItems, {
        duration: 0.2,
        opacity: 0,
        y: 15,
        stagger: 0.05,
        ease: "power3.in",
        delay: 0,
      });
      gsap.to(drawerEl, {
        duration: 0.3,
        height: 0,
        opacity: 0,
        ease: "power3.in",
        delay: 0.1,
        onComplete: () => {
          gsap.set(drawerEl, { display: "none" });
        },
      });

      gsap
        .timeline()
        .to(xIconEl, {
          duration: 0.2,
          opacity: 0,
          scale: 0.7,
          rotation: 45,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(xIconEl, { display: "none" });
          },
        })
        .set(
          menuIconEl,
          { display: "inline-block", opacity: 0, scale: 0.7, rotation: -45 },
          "+=0.05"
        )
        .to(menuIconEl, {
          duration: 0.2,
          opacity: 1,
          scale: 1,
          rotation: 0,
          ease: "power2.out",
        });
    }
  }, [isMobileMenuOpen]);

  // Effect to handle clicks outside the mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { name: "Pricing", href: "/#pricing" },
    { name: "FAQ", href: "/#faq" },
  ];

  // Reset refs on each render before populating
  navItemElementsRef.current = [];

  // Determine base classes based on variant
  const navClasses =
    variant === "primary"
      ? "bg-foreground text-secondary"
      : "bg-transparent text-foreground";

  const mobileMenuClosedColor =
    variant === "primary" ? "text-secondary" : "text-foreground";

  return (
    <nav
      aria-label="Main navigation"
      className={`${navClasses} py-4 px-6 md:px-12 fixed top-0 left-0 right-0 z-50`}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo - This is visible on all screen sizes in the top bar */}
        <Link
          href="/"
          className="text-xl md:text-3xl text-secondary font-adhynatha logo-text"
        >
          BreedBeast
        </Link>

        {/* Desktop Navigation (hidden on mobile) */}
        <div className="hidden md:flex space-x-6 items-center">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="nav-item-desktop  font-sans text-secondary font-semibold uppercase hover:text-primary-foreground transition-colors duration-300 relative group text-sm"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-foreground transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
          <button className="cta-button-desktop bg-background text-primary hover:text-secondary-foreground cursor-pointer hover:bg-primary/90 px-6 py-2 rounded-lg transition-colors duration-300 font-semibold text-sm uppercase">
            Go to Training
          </button>
        </div>

        {/* Mobile Menu Button (visible only on mobile in the top bar) */}
        {/* This button is now ONLY for opening the menu. The X button will be inside the drawer. */}
        <div className="md:hidden">
          <button
            ref={menuButtonRef}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            className={`z-50 relative transition-colors duration-300 p-2 -m-2 ${
              isMobileMenuOpen
                ? "text-primary-foreground"
                : mobileMenuClosedColor
            }`}
          >
            <div ref={menuIconWrapperRef} style={{ display: "inline-block" }}>
              <Menu size={28} />
            </div>
            <div ref={xIconWrapperRef} style={{ display: "none" }}>
              <X size={28} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        ref={mobileMenuRef}
        // Reverted from fixed inset-0 and 100vh height. Now absolute, top-0, height determined by content via GSAP.
        className="md:hidden absolute top-0 left-0 right-0 bg-foreground shadow-lg pt-20 px-6 z-40 flex flex-col pb-6 rounded-b-2xl"
        style={{ display: "none", opacity: 0, height: 0 }} // GSAP will control height and opacity
      >
        {/* Logo and X button are NOT here anymore. They are handled by the animated button above. */}
        <div className="container mx-auto flex flex-col items-center space-y-5">
          {navItems.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              ref={(el) => {
                // If Next.js Link component doesn't directly expose the <a> element for ref,
                // this might need adjustment or a different approach if direct DOM manipulation is essential beyond GSAP targets.
                // For GSAP targetting, a class or data-attribute on Link might be simpler if ref is problematic.
                if (el)
                  navItemElementsRef.current[index] =
                    el as unknown as HTMLAnchorElement;
              }}
              className="text-xl text-primary-foreground hover:text-primary-foreground/80 transition-colors duration-300"
              onClick={toggleMobileMenu}
            >
              {item.name}
            </Link>
          ))}
          <button className="cta-button-desktop bg-background text-primary hover:text-secondary-foreground cursor-pointer hover:bg-primary/90 px-6 py-2 rounded-lg transition-colors duration-300 font-semibold text-sm uppercase">
            Go to Training
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
