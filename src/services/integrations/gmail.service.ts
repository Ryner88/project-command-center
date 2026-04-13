import { mockImportantEmails } from "@/data/mock-emails";
import type { ImportantEmail } from "@/types/integrations";

export async function fetchImportantEmails(): Promise<ImportantEmail[]> {
  return mockImportantEmails;
}
