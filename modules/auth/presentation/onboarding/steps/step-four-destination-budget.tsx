import { budgetOptions, destinationOptions } from "@/modules/auth/presentation/onboarding/constants";
import { CheckItem, FieldLabel, SelectField } from "@/modules/auth/presentation/onboarding/fields";
import { toggleItem } from "@/modules/auth/presentation/onboarding/helpers";
import { OnboardingStepProps } from "@/modules/auth/presentation/onboarding/types";

export function StepFourDestinationBudget({ form, setForm }: OnboardingStepProps) {
  return (
    <div className="mt-4 space-y-4">
      <FieldLabel label="What is your typical budget per program?" />
      <SelectField
        value={form.budget}
        onChange={(value) => setForm((prev) => ({ ...prev, budget: value }))}
        placeholder="Select your typical budget"
        options={budgetOptions}
      />

      <FieldLabel label="Where would you like to join programs" />
      <div className="grid gap-y-2.5 sm:grid-cols-2 sm:gap-x-6">
        {destinationOptions.map((item) => (
          <CheckItem
            key={item}
            label={item}
            checked={form.destinations.includes(item)}
            onChange={() => setForm((prev) => ({ ...prev, destinations: toggleItem(prev.destinations, item) }))}
          />
        ))}
      </div>
    </div>
  );
}
