import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export default async function TermsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const normalizedLang = lang === "th" ? "th" : "en";

  return <LegalDocumentPage title="Terms of Service" docType="terms" lang={normalizedLang} />;
}
