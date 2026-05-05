import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { promises as fs } from "node:fs";
import path from "node:path";

type Props = {
  title: string;
  docType: "terms" | "policy";
  lang?: "en" | "th";
};

async function readLegalFile(docType: "terms" | "policy", lang: "en" | "th") {
  const filename = `${docType}-${lang}.txt`;
  const filePath = path.join(process.cwd(), "public", "assets", "legal", filename);
  return fs.readFile(filePath, "utf8");
}

export async function LegalDocumentPage({ title, docType, lang = "en" }: Props) {
  const activeLang = lang === "th" ? "th" : "en";
  const content = await readLegalFile(docType, activeLang);
  const basePath = docType === "terms" ? "/terms" : "/privacy";

  return (
    <main className="min-h-dvh w-full bg-slate-50 px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <Link href="/login" className="mb-2 inline-flex items-center gap-1 text-sm text-[#3C7ACB] hover:underline">
              <ArrowLeft size={14} />
              Back to Login
            </Link>
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">{title}</h1>
          </div>
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
            <Link
              href={`${basePath}?lang=en`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${activeLang === "en" ? "bg-[#EEF5FC] text-[#3C7ACB]" : "text-slate-500"}`}
            >
              EN
            </Link>
            <Link
              href={`${basePath}?lang=th`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${activeLang === "th" ? "bg-[#EEF5FC] text-[#3C7ACB]" : "text-slate-500"}`}
            >
              TH
            </Link>
          </div>
        </div>

        <pre className="max-h-[72dvh] overflow-auto whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 md:text-base">
          {content}
        </pre>
      </div>
    </main>
  );
}
