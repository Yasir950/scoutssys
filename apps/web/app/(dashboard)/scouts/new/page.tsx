'use client';

import React, { useState } from 'react'; // Added React for forwardRef
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateScoutSchema, CreateScoutInput } from '@scouts/shared';
import { useCreateScout } from '@/lib/api/scouts';
import { WebcamCapture } from '@/components/scouts/WebcamCapture';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const BLOOD_GROUPS = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// FIXED: Wrapped with forwardRef so React Hook Form can track user input values
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ ...props }, ref) => {
    return (
      <input 
        ref={ref} 
        {...props} 
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
      />
    );
  }
);
Input.displayName = 'Input';

export default function NewScoutPage() {
  const [step, setStep] = useState(1);
  const [photoBase64, setPhotoBase64] = useState<string | undefined>();
  const router = useRouter();
  const createScout = useCreateScout();

const {
  register,
  handleSubmit,
  trigger,
  getValues,
  watch, // <-- Add this
  formState: { errors },
} = useForm<CreateScoutInput>({
  resolver: zodResolver(CreateScoutSchema),
  defaultValues: { hasPreviousExperience: false },
});

const nextStep = async () => {
  const step1Fields: (keyof CreateScoutInput)[] = [
    'fullName', 'fatherName', 'cnicOrBForm', 'contactNumber', 
    'emergencyContact', 'city', 'area', 'unitName', 'age', 'bloodGroup'
  ];
  if (step === 1) {
    // 1. Log the values currently held by React Hook Form
    console.log("--- Form Values on Next Click ---", watch());

    // Trigger validation for Step 1 fields
    const valid = await trigger(step1Fields);
    
    // 2. Log whether validation passed or failed
    console.log("Is Step 1 Valid?", valid);

    if (!valid) {
      // 3. Log the exact validation errors Zod is producing
      console.log("--- Validation Errors ---", errors);
    }

    if (valid) setStep(2);
  } else if (step === 2) {
    setStep(3);
  }
};

  const onSubmit = async (data: CreateScoutInput) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, String(v));
    });
    if (photoBase64) {
      formData.append('photoBase64', photoBase64);
    }

    const scout = await createScout.mutateAsync(formData);
    if (scout) {
      router.push(`/scouts/${scout.id}`);
    }
  };

  const STEPS = ['Personal Info', 'Photo', 'Review & Submit'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Register New Scout</h1>
        <p className="text-sm text-slate-500 mt-1">Fill in the information below to register a new scout</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`ml-2 text-sm font-medium ${step === i + 1 ? 'text-primary-500' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-12 mx-3 ${step > i + 1 ? 'bg-green-400' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name *" error={errors.fullName?.message}>
                  <Input {...register('fullName')} placeholder="Muhammad Ahmed Khan" />
                </Field>
                <Field label="Father's Name *" error={errors.fatherName?.message}>
                  <Input {...register('fatherName')} placeholder="Khan Muhammad" />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="CNIC / B-Form *" error={errors.cnicOrBForm?.message}>
                  <Input {...register('cnicOrBForm')} placeholder="4220100000001" />
                </Field>
                <Field label="Contact Number *" error={errors.contactNumber?.message}>
                  <Input {...register('contactNumber')} placeholder="03001234567" />
                </Field>
              </div>
              <Field label="Emergency Contact *" error={errors.emergencyContact?.message}>
                <Input {...register('emergencyContact')} placeholder="03001234567" />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="City *" error={errors.city?.message}>
                  <Input {...register('city')} placeholder="Karachi" />
                </Field>
                <Field label="Area *" error={errors.area?.message}>
                  <Input {...register('area')} placeholder="Gulshan-e-Iqbal" />
                </Field>
                <Field label="Unit Name *" error={errors.unitName?.message}>
                  <Input {...register('unitName')} placeholder="Eagle Unit" />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Age *" error={errors.age?.message}>
                  <Input {...register('age')} type="number" min={8} max={25} placeholder="16" />
                </Field>
                <Field label="Blood Group *" error={errors.bloodGroup?.message}>
                  <select {...register('bloodGroup')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Select...</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg.replace('_POS', '+').replace('_NEG', '-')}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Previous Experience" error={undefined}>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input {...register('hasPreviousExperience')} type="checkbox" className="w-4 h-4" />
                    <span className="text-sm text-slate-600">Has scouting experience</span>
                  </label>
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center">
              <p className="text-sm text-slate-500 mb-4">Capture a photo of the scout or upload an existing one</p>
              <WebcamCapture onCapture={(b64) => setPhotoBase64(b64)} />
              {!photoBase64 && (
                <p className="text-xs text-amber-600 mt-3">Photo is optional but recommended for the ID card</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-900">Review Information</h2>
              {(() => {
                const values = getValues();
                return (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ['Full Name', values.fullName],
                      ["Father's Name", values.fatherName],
                      ['CNIC / B-Form', values.cnicOrBForm],
                      ['Contact', values.contactNumber],
                      ['Emergency', values.emergencyContact],
                      ['City', values.city],
                      ['Area', values.area],
                      ['Unit', values.unitName],
                      ['Age', String(values.age)],
                      ['Blood Group', String(values.bloodGroup).replace('_POS', '+').replace('_NEG', '-')],
                      ['Experience', values.hasPreviousExperience ? 'Yes' : 'No'],
                      ['Photo', photoBase64 ? 'Captured ✓' : 'None'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex gap-2">
                        <span className="text-slate-500 min-w-[100px]">{label}:</span>
                        <span className="text-slate-900 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-5">
          {step > 1 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button type="button" onClick={nextStep} className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={createScout.isPending}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
            >
              {createScout.isPending ? (
                <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registering...</>
              ) : (
                <><Check className="w-4 h-4" /> Register Scout</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}