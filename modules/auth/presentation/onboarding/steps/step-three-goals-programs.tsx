import { goalOptions, programTypeOptions } from "@/modules/auth/presentation/onboarding/constants";
import { CheckItem, FieldLabel, PillButton } from "@/modules/auth/presentation/onboarding/fields";
import { toggleItem } from "@/modules/auth/presentation/onboarding/helpers";
import { OnboardingStepProps } from "@/modules/auth/presentation/onboarding/types";

export function StepThreeGoalsPrograms({ form, setForm }: OnboardingStepProps) {
  return (
    <div className="mt-4 space-y-4">
      <FieldLabel label="What are you currently trying to achieve? (Select up to 4)" />
      <div className="grid gap-y-2.5 sm:grid-cols-2 sm:gap-x-6">
        {goalOptions.map((item) => (
          <CheckItem
            key={item}
            label={item}
            checked={form.goals.includes(item)}
            onChange={() => setForm((prev) => ({ ...prev, goals: toggleItem(prev.goals, item, 4) }))}
          />
        ))}
      </div>

      <FieldLabel label="What types of programs interest you?" />
      <div className="flex flex-wrap gap-1.5">
        {programTypeOptions.map((item) => (
          <PillButton
            key={item}
            active={form.programTypes.includes(item)}
            onClick={() => setForm((prev) => ({ ...prev, programTypes: toggleItem(prev.programTypes, item) }))}
          >
            {item}
          </PillButton>
        ))}
      </div>
    </div>
  );
}
