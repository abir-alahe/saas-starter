"use client";

import {
  Check,
  ChevronRight,
  CreditCard,
  Crown,
  Heart,
  Shield,
  Stars,
  PawPrint,
} from "lucide-react";
import {
  SinglePricingCard,
  type Testimonial,
} from "@/components/section/static/pricing/SinglePriceCard";

export function PricingSectionBasic() {
  const features = [
    "Basic Training",
    "Basic Commands",
    "Fun Tricks",
    "Super Cool Games",
    "Puppy Walk Schedule",
    "Puppy Potty Schedule",
    "more to come",
  ].map((text) => ({ text }));

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "Dog Owner",
      company: "",
      content:
        "Lessons were great! My dog is more obedient and happier. I'm so happy!",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "Sarah Miller",
      role: "Dog Owner",
      company: "",
      content:
        "I've been using beta version of this service for a few months now and my dog is doing great. The lessons are fun and effective.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Dog Owner",
      company: "",
      content:
        "fun and effective! My dog is more obedient and happier. I'm so glad I found this!",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    },
    {
      id: 4,
      name: "Emily Rodriguez",
      role: "Dog Owner",
      company: "",
      content:
        "Thank you for the great lessons! My dog is doing well, but I think I need to work on some things still.",
      rating: 4,
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      id: 5,
      name: "David Park",
      role: "Dog Owner",
      company: "",
      content:
        "I've been using beta version of this service for a few months now and my dog is doing great. The lessons are fun and effective.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    {
      id: 6,
      name: "Olivia Martinez",
      role: "Dog Owner",
      company: "",
      content:
        "Definitely recommend this service! My dog is doing great and I'm so glad I found this service!",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/24.jpg",
    },
  ];

  return (
    <section
      className="py-24 relative overflow-hidden flex justify-center"
      id="pricing"
    >
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="inline-flex items-center gap-1 px-3 py-1 mb-4 rounded-full border border-primary/20 shadow-sm">
            <CreditCard className="mr-1 h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Pricing</span>
          </div>
          <h2 className="text-3xl text-accent font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Dogs of all ages can learn new tricks!
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            You’re a Dog Training Star!
          </p>
        </div>

        <SinglePricingCard
          badge={{
            icon: Crown,
            text: "Premium",
          }}
          title="Happy Puppy"
          subtitle="Fun for you, Easy for dogs! "
          price={{
            current: "$9",
            original: "$69",
            discount: "$50 Off",
          }}
          benefits={[
            {
              text: "One-time payment",
              icon: Check,
            },
            {
              text: "lifetime updates",
              icon: Shield,
            },
            {
              text: "Community",
              icon: Heart,
            },
          ]}
          features={features}
          featuresIcon={Check}
          featuresBadge={{
            icon: Stars,
            text: "All Features",
          }}
          primaryButton={{
            text: "GET BREEDBEAST",
            icon: PawPrint,
            chevronIcon: ChevronRight,
          }}
          testimonials={testimonials}
          testimonialRotationSpeed={5000}
        />
      </div>
    </section>
  );
}
