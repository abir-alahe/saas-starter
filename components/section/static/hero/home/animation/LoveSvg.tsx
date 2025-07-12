"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const LoveSvg = () => {
  const heartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heart = heartRef.current;
    if (!heart) return;

    // Initial appear animation
    gsap.fromTo(
      heart,
      {
        scale: 0,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)",
      }
    );

    // Right to left yoyo animation
    gsap.to(heart, {
      x: -60,
      duration: 2.5,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
      delay: 1.2, // Start after the appear animation
    });
  }, []);

  return (
    <>
      <div
        ref={heartRef}
        className="absolute z-10 top-0 right-0 left-0 bottom-0 flex items-start justify-center h-[200px] md:h-[300px] w-[200px] md:w-[300px]"
      >
        <svg
          id="Layer_1"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 122.88 107.39"
        >
          <defs>
            <style>{`.cls-1{fill:#ffe57d;fill-rule:evenodd;}`}</style>
          </defs>
          <title>red-heart</title>
          <path
            className="cls-1"
            d="M60.83,17.18c8-8.35,13.62-15.57,26-17C110-2.46,131.27,21.26,119.57,44.61c-3.33,6.65-10.11,14.56-17.61,22.32-8.23,8.52-17.34,16.87-23.72,23.2l-17.4,17.26L46.46,93.55C29.16,76.89,1,55.92,0,29.94-.63,11.74,13.73.08,30.25.29c14.76.2,21,7.54,30.58,16.89Z"
          />
        </svg>
      </div>
    </>
  );
};

export default LoveSvg;
