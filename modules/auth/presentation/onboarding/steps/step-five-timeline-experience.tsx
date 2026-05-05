import { discoveryOptions, joinedBeforeOptions } from "@/modules/auth/presentation/onboarding/constants";
import { CheckItem, FieldLabel, SelectField, TextField } from "@/modules/auth/presentation/onboarding/fields";
import { toggleItem } from "@/modules/auth/presentation/onboarding/helpers";
import { OnboardingStepProps } from "@/modules/auth/presentation/onboarding/types";

export function StepFiveTimelineExperience({ form, setForm }: OnboardingStepProps) {
  return (
    <div className="mt-4 space-y-4">
      <FieldLabel label="How many programs have you joined before?" />
      <SelectField
        value={form.joinedBefore}
        onChange={(value) => setForm((prev) => ({ ...prev, joinedBefore: value }))}
        placeholder="Select your program you have joined before"
        options={joinedBeforeOptions}
      />

      <FieldLabel label="Where did you hear about our platform?" />
      <div className="grid gap-y-2.5 sm:grid-cols-2 sm:gap-x-6">
        {discoveryOptions.map((item) => (
          <CheckItem
            key={item}
            label={item}
            checked={form.discoveryChannels.includes(item)}
            onChange={() => setForm((prev) => ({ ...prev, discoveryChannels: toggleItem(prev.discoveryChannels, item) }))}
          />
        ))}
      </div>

      {form.discoveryChannels.includes("Other") ? (
        <TextField
          value={form.otherDiscovery}
          onChange={(value) => setForm((prev) => ({ ...prev, otherDiscovery: value }))}
          placeholder="Please specify"
        />
      ) : null}
    </div>
  );
}
