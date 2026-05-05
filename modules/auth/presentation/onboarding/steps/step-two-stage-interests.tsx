import { interestOptions, stageOptions } from "@/modules/auth/presentation/onboarding/constants";
import { FieldLabel, PillButton, SelectField, TextField } from "@/modules/auth/presentation/onboarding/fields";
import { toggleItem } from "@/modules/auth/presentation/onboarding/helpers";
import { OnboardingStepProps } from "@/modules/auth/presentation/onboarding/types";

export function StepTwoStageInterests({ form, setForm }: OnboardingStepProps) {
  return (
    <div className="mt-4 space-y-4">
      <FieldLabel label="What is your current stage?" />
      <SelectField
        value={form.stage}
        onChange={(value) => setForm((prev) => ({ ...prev, stage: value }))}
        placeholder="Select your current stage"
        options={stageOptions}
      />

      <FieldLabel label="Which field(s) are you most interested in? (Select up to 3)" />
      <div className="flex flex-wrap gap-1.5">
        {interestOptions.map((item) => (
          <PillButton
            key={item}
            active={form.interests.includes(item)}
            onClick={() => setForm((prev) => ({ ...prev, interests: toggleItem(prev.interests, item, 3) }))}
          >
            {item}
          </PillButton>
        ))}
      </div>

      {form.interests.includes("Other") ? (
        <TextField
          value={form.otherInterest}
          onChange={(value) => setForm((prev) => ({ ...prev, otherInterest: value }))}
          placeholder="Specify other"
        />
      ) : null}
    </div>
  );
}
