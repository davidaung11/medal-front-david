import { phoneCountryCodeOptions } from "@/modules/auth/presentation/onboarding/constants";
import { FieldLabel, SelectField, TextField } from "@/modules/auth/presentation/onboarding/fields";
import { OnboardingStepProps } from "@/modules/auth/presentation/onboarding/types";

export function StepOneBasicInfo({ form, setForm }: OnboardingStepProps) {
  return (
    <div className="space-y-3">
      <FieldLabel label="Email" />
      <TextField value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} placeholder="bbbkk@email.com" />

      <FieldLabel label="Full Name" />
      <TextField value={form.fullName} onChange={(value) => setForm((prev) => ({ ...prev, fullName: value }))} placeholder="BBkkk" />

      <FieldLabel label="Username" />
      <TextField value={form.username} onChange={(value) => setForm((prev) => ({ ...prev, username: value }))} placeholder="@ BBkkk" />

      <FieldLabel label="Phone Number" />
      <div className="grid grid-cols-[98px_1fr] gap-2">
        <SelectField
          value={form.phoneCountryCode}
          onChange={(value) => setForm((prev) => ({ ...prev, phoneCountryCode: value }))}
          options={phoneCountryCodeOptions}
        />
        <TextField
          value={form.phoneNumber}
          onChange={(value) => setForm((prev) => ({ ...prev, phoneNumber: value }))}
          placeholder="84 268 8558"
        />
      </div>
    </div>
  );
}
