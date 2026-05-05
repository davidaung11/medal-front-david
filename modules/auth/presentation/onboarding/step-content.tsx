import { StepOneBasicInfo } from "@/modules/auth/presentation/onboarding/steps/step-one-basic-info";
import { StepTwoStageInterests } from "@/modules/auth/presentation/onboarding/steps/step-two-stage-interests";
import { StepThreeGoalsPrograms } from "@/modules/auth/presentation/onboarding/steps/step-three-goals-programs";
import { StepFourDestinationBudget } from "@/modules/auth/presentation/onboarding/steps/step-four-destination-budget";
import { StepFiveTimelineExperience } from "@/modules/auth/presentation/onboarding/steps/step-five-timeline-experience";
import { OnboardingStepProps } from "@/modules/auth/presentation/onboarding/types";

export function OnboardingStepContent({ step, ...props }: OnboardingStepProps & { step: number }) {
  if (step === 0) {
    return <StepOneBasicInfo {...props} />;
  }

  if (step === 1) {
    return <StepTwoStageInterests {...props} />;
  }

  if (step === 2) {
    return <StepThreeGoalsPrograms {...props} />;
  }

  if (step === 3) {
    return <StepFourDestinationBudget {...props} />;
  }

  return <StepFiveTimelineExperience {...props} />;
}
