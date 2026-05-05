import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const normalizedLang = lang === "th" ? "th" : "en";

  return <LegalDocumentPage title="Privacy Notice" docType="policy" lang={normalizedLang} />;
}
