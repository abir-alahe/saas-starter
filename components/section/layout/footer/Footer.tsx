"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import { PiDogFill } from "react-icons/pi";

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { name: "Dashboard", href: "https://app.breedbeast.com" },
  { name: "Pricing", href: "/team" },
  { name: "FAQ", href: "/#faq" },
  { name: "Support", href: "mailto:mdabiralahe@gmail.com" },
];

const socialLinksLeft = [
  { name: "Facebook", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "YouTube", href: "#" },
];
const socialLinksRight = [
  { name: "Twitter", href: "#" },
  { name: "TikTok", href: "#" },
  { name: "LinkedIn", href: "#" },
  { name: "Pinterest", href: "#" },
];

const Footer = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const bigTextRef = useRef<HTMLSpanElement>(null);
  // Collect refs for all footer links
  const linkUnderlineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let ctx: gsap.Context;
    if (footerRef.current && bigTextRef.current) {
      ctx = gsap.context(() => {
        gsap.fromTo(
          footerRef.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
        gsap.fromTo(
          bigTextRef.current,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            delay: 0.2,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }, footerRef);
    }
    return () => ctx && ctx.revert();
  }, []);

  // GSAP hover underline animation handlers
  const handleLinkEnter = (index: number) => {
    const underline = linkUnderlineRefs.current[index];
    if (underline) {
      gsap.to(underline, { width: "100%", duration: 0.35, ease: "power2.out" });
    }
  };
  const handleLinkLeave = (index: number) => {
    const underline = linkUnderlineRefs.current[index];
    if (underline) {
      gsap.to(underline, { width: "0%", duration: 0.3, ease: "power2.in" });
    }
  };
  // Reset refs on each render
  linkUnderlineRefs.current = [];

  // Helper to render a link with animated underline
  const AnimatedFooterLink = ({
    href,
    children,
    index,
  }: {
    href: string;
    children: React.ReactNode;
    index: number;
  }) => (
    <Link
      href={href}
      className="relative inline-block text-inherit transition-colors duration-200 cursor-pointer"
      onMouseEnter={() => handleLinkEnter(index)}
      onMouseLeave={() => handleLinkLeave(index)}
    >
      <span>{children}</span>
      <span
        ref={(el) => {
          linkUnderlineRefs.current[index] = el;
        }}
        className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-0.5 w-0 bg-white transition-all duration-200 rounded-full"
        aria-hidden="true"
      />
    </Link>
  );

  let linkIdx = 0;

  return (
    <footer className="w-full bg-background flex justify-center pt-8 font-roboto-flex">
      <div
        ref={footerRef}
        className="w-full bg-[#FF6900] rounded-t-4xl md:rounded-t-[50px] px-4 sm:px-6 md:px-12 py-8 md:py-14 flex flex-col gap-8 md:gap-12 shadow-lg relative"
      >
        {/* Top Row: Logo, Nav, Social */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
          {/* Logo */}
          <div className="flex flex-col md:items-start items-center gap-2 min-w-[60px] mb-4 md:mb-0">
            <div className="bg-background rounded-full w-12 h-12 flex items-center justify-center">
              <PiDogFill className="text-3xl text-primary" />
            </div>
          </div>
          {/* Nav Links */}
          <div className="flex flex-col gap-1 text-secondary text-sm font-medium uppercase text-center items-center md:text-left mb-4 md:mb-0">
            {navLinks.map((link) => (
              <AnimatedFooterLink
                key={link.href + link.name}
                href={link.href}
                index={linkIdx++}
              >
                {link.name}
              </AnimatedFooterLink>
            ))}
          </div>
          {/* Social Links */}
          <div className="flex flex-col md:flex-row gap-10 md:ms-auto">
            <div className="flex flex-col gap-1 text-secondary text-sm font-medium uppercase items-center text-center md:items-end md:text-right">
              {socialLinksLeft.map((link) => (
                <AnimatedFooterLink
                  key={link.href + link.name}
                  href={link.href}
                  index={linkIdx++}
                >
                  {link.name}
                </AnimatedFooterLink>
              ))}
            </div>
            <div className="flex flex-col gap-1 text-secondary text-sm font-medium uppercase items-center text-center md:items-end md:text-right">
              {socialLinksRight.map((link) => (
                <AnimatedFooterLink
                  key={link.href + link.name}
                  href={link.href}
                  index={linkIdx++}
                >
                  {link.name}
                </AnimatedFooterLink>
              ))}
            </div>
          </div>
        </div>
        {/* Brand Name */}
        <div className="w-full flex justify-center items-center">
          <span
            ref={bigTextRef}
            className="text-[clamp(2.5rem,10vw,7rem)] font-adhynatha font-extrabold uppercase text-secondary leading-none tracking-tight text-center"
          >
            BreedBeast
          </span>
        </div>
        {/* Bottom Row: Copyright & Privacy */}
        <div className="flex flex-col md:flex-row justify-between items-center text-secondary text-xs font-medium gap-2">
          <span>© 2025 BreedBeast. All rights reserved</span>
          <div className="flex gap-4">
            <AnimatedFooterLink
              key="terms-of-service"
              href="#"
              index={linkIdx++}
            >
              Terms of Service
            </AnimatedFooterLink>
            <AnimatedFooterLink key="privacy-policy" href="#" index={linkIdx++}>
              Privacy policy
            </AnimatedFooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
