"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";
import {
  initialOnboardingFormState,
  onboardingSteps,
  ONBOARDING_COMPLETED_KEY,
} from "@/modules/auth/presentation/onboarding/constants";
import { canProceedByStep } from "@/modules/auth/presentation/onboarding/helpers";
import { OnboardingStepContent } from "@/modules/auth/presentation/onboarding/step-content";

export function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialOnboardingFormState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (saved === "true") {
      router.replace(ROUTES.dashboard);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const email = params.get("email")?.trim() ?? "";
    if (email) {
      setForm((prev) => ({ ...prev, email }));
    }
  }, [router]);

  const canProceed = useMemo(() => canProceedByStep(form, step), [form, step]);
  const currentStep = onboardingSteps[step];
  const isLastStep = step === onboardingSteps.length - 1;

  function onNext() {
    if (!canProceed) {
      return;
    }
    setStep((prev) => Math.min(prev + 1, onboardingSteps.length - 1));
  }

  function onBack() {
    setStep((prev) => Math.max(0, prev - 1));
  }

  async function onDone() {
    if (!canProceed || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      window.localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      router.replace(ROUTES.dashboard);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-dvh w-full overflow-hidden px-2 py-2 sm:px-3 sm:py-3">
      <div className="mx-auto h-full w-full max-w-[1320px] overflow-hidden rounded-sm border border-sky-200 bg-[#edf5fc]">
        <div className="grid h-full lg:grid-cols-[43%_57%]">
          <section className="relative hidden overflow-hidden bg-[#edf4fb] lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-[#f6f9fd] via-[#ecf4fb] to-[#e6eff9]" />
            <div className="absolute -bottom-[34%] -left-[26%] h-[88%] w-[118%] rounded-[56%] border border-sky-300/35" />
            <div className="absolute -bottom-[36%] -left-[26%] h-[92%] w-[122%] rounded-[56%] border border-sky-300/25" />
            <div className="absolute -bottom-[40%] -left-[31%] h-[96%] w-[126%] rounded-[58%] border border-sky-300/20" />
            <div className="absolute -bottom-[42%] -left-[34%] h-[105%] w-[136%] rounded-[60%] border border-sky-300/20" />
            <div className="absolute -bottom-[44%] -left-[38%] h-[112%] w-[145%] rounded-[62%] bg-sky-200/26" />
          </section>

          <section className="flex h-full items-center bg-gradient-to-r from-[#edf4fb] to-[#eff7fd] px-4 py-5 sm:px-5 md:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[640px] overflow-y-auto">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] text-slate-400">{currentStep.tag}</p>
                  <h1 className="mt-1 text-3xl font-semibold leading-tight text-slate-800">{currentStep.title}</h1>
                  {currentStep.subtitle ? <p className="mt-2 max-w-[560px] text-base text-slate-600">{currentStep.subtitle}</p> : null}
                </div>
                <p className="pt-1 text-md text-slate-400">{`Step ${step + 1}/5`}</p>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <OnboardingStepContent step={step} form={form} setForm={setForm} />
              </div>

              <div className="mt-6 flex gap-3">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="h-10 min-w-[120px] rounded-xl border border-slate-200 bg-white px-5 text-base font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                ) : null}

                <button
                  type="button"
                  disabled={!canProceed || submitting}
                  onClick={isLastStep ? onDone : onNext}
                  className={`h-10 flex-1 rounded-xl px-5 text-base font-semibold transition ${
                    canProceed
                      ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-black hover:to-slate-900"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {isLastStep ? (submitting ? "Saving..." : "Done") : "Next"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
