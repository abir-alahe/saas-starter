import FAQOne from "@/components/ui/FAQOne";

export default function FAQ() {
  const Faq = [
    {
      question: "What is BreedBeast?",
      answer:
        "BreedBeast is a comprehensive platform for dog breeders and enthusiasts, offering tools for pedigree tracking, breeding management, and community engagement.",
    },
    {
      question: "How does the breeding management system work?",
      answer:
        "Our breeding management system allows you to track pedigrees, manage breeding pairs, record health information, and maintain detailed records of your breeding program.",
    },
    {
      question: "Can I customize my breeder profile?",
      answer:
        "Yes, you can personalize your breeder profile with your kennel information, breeding history, available dogs, and showcase your achievements.",
    },
    {
      question: "Is there a mobile app available?",
      answer:
        "Yes, BreedBeast is accessible on both web and mobile devices, allowing you to manage your breeding program on the go.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "We provide comprehensive support through our help center, email support, and community forums where you can connect with other breeders.",
    },
  ];
  return (
    <section id="faq" className="max-w-[500px] md:max-w-[800px] mx-auto pb-16">
      {/* Section Title */}
      <div className="flex flex-col items-center mb-12 text-center">
        <div className="px-3 py-1 mb-4 rounded-full border border-primary/20 shadow-sm">
          <span className="text-xs font-medium">FAQ&apos;s</span>
        </div>
        <h2 className="text-3xl text-accent font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
          Frequently Asked Questions
        </h2>
      </div>
      {/* FAQ content */}
      <div className="flex flex-col lg:flex-row gap-2.5 lg:gap-6">
        <FAQOne faqs={Faq} />
      </div>
    </section>
  );
}
