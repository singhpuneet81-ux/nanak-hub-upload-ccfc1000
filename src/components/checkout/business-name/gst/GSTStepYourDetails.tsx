import React from "react";
import { useCheckout } from "@/context/CheckoutFlowProvider";
import { SoftInput, SoftSelect } from "@/components/checkout/FormInputs";
import { PillToggle } from "@/components/checkout/abn/PillToggle";
import { FileUpload } from "@/components/checkout/abn/FileUpload";
import { ApplicantDeclaration } from "@/components/checkout/abn/ApplicantDeclaration";
import { PrimaryButton } from "@/components/checkout/Buttons";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const GSTStepYourDetails = ({ onNext }: { onNext: () => void }) => {
  const { customer, updateCustomer } = useCheckout();
  const set = (k: string, v: any) => updateCustomer({ [k]: v });

  const valid =
    customer.firstName &&
    customer.lastName &&
    customer.businessName &&
    customer.gstStartDate &&
    customer.signature &&
    customer.declarationAccepted;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Your Details</h2>

      <SoftInput label="First Name" required value={customer.firstName||""} onChange={e=>set("firstName",e.target.value)} />
      <SoftInput label="Last Name" required value={customer.lastName||""} onChange={e=>set("lastName",e.target.value)} />
      <SoftInput label="Business Name" required value={customer.businessName||""} onChange={e=>set("businessName",e.target.value)} />
      <div>
        <label className="form-label">GST Start Date <span className="text-destructive">*</span></label>
        <Popover modal>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal h-11", !customer.gstStartDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customer.gstStartDate || <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[9999]" align="start">
            <Calendar
              mode="single"
              selected={customer.gstStartDate ? new Date(customer.gstStartDate.split("-").reverse().join("-")) : undefined}
              onSelect={(date) => date && set("gstStartDate", format(date, "dd-MM-yyyy"))}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <PillToggle
        label="Accounting Basis"
        value={customer.accountingBasis||""}
        onChange={(v)=>set("accountingBasis",v)}
        options={[{value:"cash",label:"Cash"},{value:"accrual",label:"Accrual"}]}
      />

      <FileUpload label="Upload ID Proof" required value={customer.idProof||null} onChange={f=>set("idProof",f)} />

      <SoftInput label="Signature" required value={customer.signature||""} onChange={e=>set("signature",e.target.value)} />

      <ApplicantDeclaration
        firstName={customer.firstName||""}
        lastName={customer.lastName||""}
        accepted={customer.declarationAccepted||false}
        onAcceptChange={(v)=>set("declarationAccepted",v)}
      />

      <div className="flex justify-end">
        <PrimaryButton disabled={!valid} onClick={onNext}>
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
};