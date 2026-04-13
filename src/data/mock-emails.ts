import type { ImportantEmail } from "@/types/integrations";

export const mockImportantEmails: ImportantEmail[] = [
  {
    id: "email_1",
    from: "Sarah Chen <sarah@northstarstudio.co>",
    subject: "Quote request for website redesign",
    preview:
      "We need a quote for a 10-page website redesign with CMS editing, case studies, and lead capture before next week's board review.",
    requiresProposal: true,
    category: "quote_request"
  },
  {
    id: "email_3",
    from: "Avery Cole <avery@studioops.co>",
    subject: "Existing proposal due Thursday",
    preview:
      "Reminder: the Acme website redesign proposal is due Thursday at 5 PM and still needs final pricing review.",
    requiresProposal: false,
    category: "existing_proposal"
  }
];
