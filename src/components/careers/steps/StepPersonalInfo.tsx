import React from "react";
import { User, Mail, Phone, MapPin, Linkedin, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { JobApplicationData } from "../JobApplicationModal";

type Props = {
  data: JobApplicationData;
  errors: Record<string, string>;
  update: (fields: Partial<JobApplicationData>) => void;
};

const Field = ({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

const IconInput = ({ icon: Icon, ...props }: { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input className="pl-9" {...props} />
  </div>
);

const StepPersonalInfo: React.FC<Props> = ({ data, errors, update }) => (
  <div>
    <div className="flex items-center gap-3 mb-6">
      <div className="w-11 h-11 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
        <User className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-bold">Personal Information</h3>
        <p className="text-sm text-muted-foreground">Let's start with the basics</p>
      </div>
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="First Name" required error={errors.firstName}>
          <Input placeholder="John" value={data.firstName} onChange={(e) => update({ firstName: e.target.value })} />
        </Field>
        <Field label="Last Name" required error={errors.lastName}>
          <Input placeholder="Smith" value={data.lastName} onChange={(e) => update({ lastName: e.target.value })} />
        </Field>
      </div>
      <Field label="Email Address" required error={errors.email}>
        <IconInput icon={Mail} type="email" placeholder="john.smith@email.com" value={data.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ email: e.target.value })} />
      </Field>
      <Field label="Phone Number" required error={errors.phone}>
        <IconInput icon={Phone} placeholder="0400 123 456" value={data.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ phone: e.target.value })} />
      </Field>
      <Field label="Current Location" required error={errors.location}>
        <IconInput icon={MapPin} placeholder="Sydney, NSW" value={data.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ location: e.target.value })} />
      </Field>
      <Field label="LinkedIn Profile URL" error={errors.linkedin}>
        <IconInput icon={Linkedin} placeholder="linkedin.com/in/yourprofile" value={data.linkedin} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ linkedin: e.target.value })} />
      </Field>
      <Field label="Portfolio / Website URL" error={errors.portfolio}>
        <IconInput icon={Link2} placeholder="yourwebsite.com" value={data.portfolio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ portfolio: e.target.value })} />
      </Field>
    </div>
  </div>
);

export default StepPersonalInfo;
