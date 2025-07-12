"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const ToolTipSvg = () => {
  const k9Ref = useRef<HTMLDivElement>(null);
  const funRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create timeline for k-9 tooltip
    const k9Timeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
    });

    k9Timeline.to(k9Ref.current, {
      y: -10,
      rotation: -15,
      duration: 2,
      ease: "sine.inOut",
    });

    // Create timeline for fun tooltip
    const funTimeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
    });

    funTimeline.to(funRef.current, {
      x: -5,
      rotation: 50,
      duration: 1.5,
      ease: "sine.inOut",
    });

    return () => {
      k9Timeline.kill();
      funTimeline.kill();
    };
  }, []);

  return (
    <>
      <div
        ref={k9Ref}
        className="absolute -top-1 -right-25 -rotate-13 bg-black text-accent w-fit px-2 py-1 rounded-full text-[10px] md:text-sm font-roboto-flex"
      >
        k-9
      </div>
      <div
        ref={funRef}
        className="absolute -top-3 -left-25 md:left-0 md:-rotate-1 rotate-45 bg-lime-400 text-accent w-fit px-2 py-1 rounded-full text-[10px] md:text-sm font-roboto-flex"
      >
        fun
      </div>
    </>
  );
};

export default ToolTipSvg;
