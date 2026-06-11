'use client';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'react-qr-code';
import { formatDate } from '@/lib/utils/format';
import { Printer } from 'lucide-react';

interface DutyCardProps {
  assignment: {
    id: string;
    scout: {
      registrationNumber: string;
      fullName: string;
      fatherName: string;
      photoUrl: string | null;
      bloodGroup: string | null;
      emergencyContact: string | null;
    };
    department: {
      name: string;
      location: string | null;
    };
    shift: string;
    dutyDate: string;
    role: string | null;
    reportingTime: string | null;
  };
  programName?: string;
}

function DutyCardPrint({ assignment, programName }: DutyCardProps) {
  const { scout, department } = assignment;

  return (
    <div className="w-[3.5in] h-[5in] bg-white border-2 border-[#1E3A5F] rounded-xl overflow-hidden font-sans print:border-2 print:shadow-none shadow-xl">
      {/* Header */}
      <div className="bg-[#1E3A5F] text-white px-4 py-3">
        <div className="text-xs font-semibold opacity-75 uppercase tracking-widest">Duty Card</div>
        <div className="text-sm font-bold mt-0.5 truncate">{programName ?? 'Scouts Program'}</div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Photo + Basic Info */}
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {scout.photoUrl ? (
              <img src={scout.photoUrl} alt={scout.fullName} className="w-16 h-20 object-cover rounded-lg border border-slate-200" />
            ) : (
              <div className="w-16 h-20 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-2xl text-slate-300">
                {scout.fullName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-slate-900 leading-tight">{scout.fullName}</div>
            <div className="text-xs text-slate-500 mt-0.5">S/O {scout.fatherName}</div>
            <div className="mt-2 text-xs font-mono text-[#1E3A5F] font-semibold">{scout.registrationNumber}</div>
            {scout.bloodGroup && (
              <div className="mt-1 inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">{scout.bloodGroup}</div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200" />

        {/* Duty Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Department</span>
            <span className="text-xs font-semibold text-slate-800">{department.name}</span>
          </div>
          {department.location && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Location</span>
              <span className="text-xs font-semibold text-slate-800">{department.location}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Duty Date</span>
            <span className="text-xs font-semibold text-slate-800">{formatDate(assignment.dutyDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Shift</span>
            <span className="text-xs font-semibold text-slate-800 capitalize">{assignment.shift.toLowerCase()}</span>
          </div>
          {assignment.reportingTime && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Report Time</span>
              <span className="text-xs font-semibold text-slate-800">{assignment.reportingTime}</span>
            </div>
          )}
          {assignment.role && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Role</span>
              <span className="text-xs font-semibold text-slate-800">{assignment.role}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200" />

        {/* QR + Emergency */}
        <div className="flex items-end justify-between">
          <div>
            {scout.emergencyContact && (
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Emergency</div>
                <div className="text-xs font-semibold text-slate-700">{scout.emergencyContact}</div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-1">
            <QRCode value={assignment.id} size={56} />
            <span className="text-[9px] text-slate-400">Scan to verify</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-center">
        <span className="text-[10px] text-slate-400">This card is non-transferable · Keep with you during duty</span>
      </div>
    </div>
  );
}

export function DutyCard({ assignment, programName }: DutyCardProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  return (
    <div className="space-y-3">
      <div ref={printRef} className="inline-block">
        <DutyCardPrint assignment={assignment} programName={programName} />
      </div>
      <button
        onClick={() => handlePrint()}
        className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#16305a] transition"
      >
        <Printer className="w-4 h-4" />
        Print Duty Card
      </button>
    </div>
  );
}
