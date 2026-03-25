import React from "react";
import { Heart } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JobApplicationData } from "../JobApplicationModal";

type Props = {
  data: JobApplicationData;
  errors: Record<string, string>;
  update: (fields: Partial<JobApplicationData>) => void;
};

const SALARY_OPTIONS = ["$50k - $60k + Super", "$60k - $70k + Super", "$70k - $85k + Super", "$85k - $100k + Super", "$100k - $120k + Super", "$120k+ + Super", "Negotiable"];
const AVAILABILITY_OPTIONS = ["Immediately", "1 week", "2 weeks", "1 month", "2 months", "3 months", "Flexible"];
const WORK_OPTIONS = ["Office-based (5 days)", "Hybrid (3 days office, 2 WFH)", "Flexible hybrid", "Remote (if available)"];

const StepMotivation: React.FC<Props> = ({ data, errors, update }) => (
  <div>
    <div className="flex items-center gap-3 mb-6">
      <div className="w-11 h-11 rounded-xl bg-[hsl(var(--success)/0.1)] flex items-center justify-center">
        <Heart className="w-5 h-5 text-success" />
      </div>
      <div>
        <h3 className="text-xl font-bold">Motivation & Fit</h3>
        <p className="text-sm text-muted-foreground">Why Nanak Accountants? Why this role?</p>
      </div>
    </div>

    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Why do you want to join Nanak Accountants & Associates? <span className="text-destructive">*</span></Label>
        <p className="text-xs text-muted-foreground">Be specific and genuine. What excites you about our company? What have you learned about us? (Minimum 100 characters)</p>
        <Textarea rows={4} placeholder="Example: I'm drawn to Nanak Accountants' reputation for innovation in cloud accounting..." value={data.whyJoin} onChange={(e) => update({ whyJoin: e.target.value })} />
        <p className="text-xs text-muted-foreground text-right">{data.whyJoin.length}/100+ characters</p>
        {errors.whyJoin && <p className="text-xs text-destructive">{errors.whyJoin}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Why are you interested in this specific role? <span className="text-destructive">*</span></Label>
        <p className="text-xs text-muted-foreground">What about this position appeals to you? How does it align with your career goals? (Minimum 100 characters)</p>
        <Textarea rows={4} placeholder="Example: This role aligns perfectly with my goal to specialize in tax advisory..." value={data.whyRole} onChange={(e) => update({ whyRole: e.target.value })} />
        <p className="text-xs text-muted-foreground text-right">{data.whyRole.length}/100+ characters</p>
        {errors.whyRole && <p className="text-xs text-destructive">{errors.whyRole}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">What are your key strengths for this role? <span className="text-destructive">*</span></Label>
        <p className="text-xs text-muted-foreground">List 3-5 specific strengths with examples. (Minimum 50 characters)</p>
        <Textarea rows={4} placeholder="Example:
1. Technical expertise: Advanced Xero & MYOB, complex tax returns
2. Client communication: Built strong relationships, 95% retention rate
3. Problem-solving: Identified $50k in tax savings for clients" value={data.strengths} onChange={(e) => update({ strengths: e.target.value })} />
        <p className="text-xs text-muted-foreground text-right">{data.strengths.length} characters</p>
        {errors.strengths && <p className="text-xs text-destructive">{errors.strengths}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Salary Expectations <span className="text-destructive">*</span></Label>
          <select value={data.salaryExpectation} onChange={(e) => update({ salaryExpectation: e.target.value })} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select range</option>
            {SALARY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {errors.salaryExpectation && <p className="text-xs text-destructive">{errors.salaryExpectation}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Availability to Start <span className="text-destructive">*</span></Label>
          <select value={data.availability} onChange={(e) => update({ availability: e.target.value })} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select availability</option>
            {AVAILABILITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {errors.availability && <p className="text-xs text-destructive">{errors.availability}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Preferred Work Arrangement</Label>
        <select value={data.workArrangement} onChange={(e) => update({ workArrangement: e.target.value })} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Select preference</option>
          {WORK_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  </div>
);

export default StepMotivation;
