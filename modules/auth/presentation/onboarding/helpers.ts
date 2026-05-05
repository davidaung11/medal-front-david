import { OnboardingFormState } from "@/modules/auth/presentation/onboarding/types";

export function toggleItem(items: string[], target: string, max = Number.POSITIVE_INFINITY) {
  if (items.includes(target)) {
    return items.filter((item) => item !== target);
  }
  if (items.length >= max) {
    return items;
  }
  return [...items, target];
}

export function canProceedByStep(form: OnboardingFormState, step: number) {
  if (step === 0) {
    return Boolean(form.email.trim() && form.fullName.trim() && form.username.trim() && form.phoneNumber.trim());
  }

  if (step === 1) {
    const hasOther = form.interests.includes("Other");
    return Boolean(form.stage && form.interests.length > 0 && (!hasOther || form.otherInterest.trim()));
  }

  if (step === 2) {
    return form.goals.length > 0 && form.programTypes.length > 0;
  }

  if (step === 3) {
    return Boolean(form.budget && form.destinations.length > 0);
  }

  const hasOther = form.discoveryChannels.includes("Other");
  return Boolean(form.joinedBefore && form.discoveryChannels.length > 0 && (!hasOther || form.otherDiscovery.trim()));
}
