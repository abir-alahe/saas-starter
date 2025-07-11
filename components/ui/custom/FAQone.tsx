import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function FAQOne({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  return (
    <section className="w-full px-4 md:px-0 flex flex-col items-center">
      <div className="w-full grid grid-cols-1 gap-y-2.5">
        {faqs.map((faq, idx) => (
          <Accordion type="single" collapsible key={faq.question}>
            <AccordionItem
              value={`faq-${idx}`}
              className=" rounded-xl px-[16px] lg:px-[30px] py-4"
            >
              <AccordionTrigger className="text-[20px] font-semibold flex justify-between items-center">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[18px] font-semibold mt-2 text-primary/80">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </section>
  );
}
