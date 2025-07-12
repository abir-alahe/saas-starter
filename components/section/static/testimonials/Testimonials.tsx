"use client";

import TestimonialCard from "@/components/ui/custom/testimonialCard";
import React, { ReactElement } from "react";
import Masonry from "react-masonry-css";

interface Testimonial {
  id: number;
  name: string;
  profile: string;
  postImage: string;
  src: string;
  description: string;
  time: string;
  date: string;
  link: string;
  like: number;
}

interface BreakpointColumns {
  default: number;
  [key: number]: number;
}

export default function Testimonials(): ReactElement {
  const breakpointColumns: BreakpointColumns = {
    default: 4,
    1400: 4,
    1100: 3,
    850: 2,
    640: 1,
  };

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "John Doe",
      profile: "/assets/image/Testimonials/john-doe/john-doe.png",
      postImage: "/assets/image/Testimonials/john-doe/post.png",
      src: "/assets/image/Testimonials/john-doe.png",
      description: `Woo! DataFast is awesome! Setting up properly the events you can see the whole journey of a user.`,
      time: "10:00 AM",
      date: "Dec 12, 2024",
      link: "https://x.com/magiobus/status/1864502014253654172",
      like: 45,
    },
    {
      id: 2,
      name: "Jane Doe",
      profile: "/assets/image/Testimonials/john-doe/john-doe.png",
      postImage: "/assets/image/Testimonials/john-doe/post.png",
      src: "/assets/image/Testimonials/john-doe/post.png",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.Woo! DataFast is awesome! Setting up properly the events you can see the whole journey of a user.",
      time: "10:00 AM",
      date: "Dec 12, 2024",
      link: "https://x.com/magiobus/status/1864502014253654172",
      like: 41,
    },
    {
      id: 3,
      name: "John Doe",
      profile: "/assets/image/Testimonials/john-doe/john-doe.png",
      postImage: "/assets/image/Testimonials/john-doe/post.png",
      src: "/assets/image/Testimonials/john-doe.png",
      description: `Woo! DataFast is awesome! Setting up properly the events you can see the whole journey of a user.`,
      time: "10:00 AM",
      date: "Dec 12, 2024",
      link: "https://x.com/magiobus/status/1864502014253654172",
      like: 5,
    },
    {
      id: 4,
      name: "Jane Doe",
      profile: "/assets/image/Testimonials/john-doe/john-doe.png",
      postImage: "/assets/image/Testimonials/john-doe/post.png",
      src: "/assets/image/Testimonials/john-doe/post.png",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.Woo! DataFast is awesome! Setting up properly the events you can see the whole journey of a user.Woo! DataFast is awesome! Setting up properly the events you can see the whole journey of a user.",
      time: "10:00 AM",
      date: "Dec 12, 2024",
      link: "https://x.com/magiobus/status/1864502014253654172",
      like: 14,
    },
    {
      id: 5,
      name: "John Doe",
      profile: "/assets/image/Testimonials/john-doe/john-doe.png",
      postImage: "/assets/image/Testimonials/john-doe/post.png",
      src: "/assets/image/Testimonials/john-doe.png",
      description: `Woo! DataFast is awesome! Setting up properly the events you can see the whole journey of a user.`,
      time: "10:00 AM",
      date: "Dec 12, 2024",
      link: "https://x.com/magiobus/status/1864502014253654172",
      like: 10,
    },
    {
      id: 6,
      name: "Jane Doe",
      profile: "/assets/image/Testimonials/john-doe/john-doe.png",
      postImage: "/assets/image/Testimonials/john-doe/post.png",
      src: "/assets/image/Testimonials/john-doe/post.png",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
      time: "10:00 AM",
      date: "Dec 12, 2024",
      link: "https://x.com/magiobus/status/1864502014253654172",
      like: 10,
    },
  ];

  return (
    <div className="max-w-[450px] sm:max-w-[800px] md:max-w-[1300px] mx-auto px-4 w-full pb-24">
      {/* section title */}
      <div className="flex flex-col items-center mb-12 text-center">
        <div className="px-3 py-1 mb-4 rounded-full border border-primary/20 shadow-sm">
          <span className="text-xs font-medium">Testimonials</span>
        </div>
        <h2 className="text-3xl text-accent font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
          What our customers say
        </h2>
        <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
          We are proud to have a strong reputation for providing high-quality
          resources and services to our customers.
        </p>
      </div>
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex w-full -ml-2 sm:-ml-4"
        columnClassName="pl-2 sm:pl-4 bg-clip-padding"
      >
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="mb-2 sm:mb-4">
            <TestimonialCard {...testimonial} />
          </div>
        ))}
      </Masonry>
    </div>
  );
}
