'use client';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'react-qr-code';
import { ScoutDTO } from '@scouts/shared';
import { formatBloodGroup, formatDate } from '@/lib/utils/format';
import { Printer, Download } from 'lucide-react';

interface IDCardProps {
  scout: ScoutDTO;
  programName?: string;
}

function IDCardFront({ scout, programName }: IDCardProps) {
  console.log('photoPath:', scout.photoPath);
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

  return (
    <div style={{ width: '85.6mm', height: '53.98mm', background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)', borderRadius: '6px', padding: '6px', display: 'flex', gap: '8px', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        {scout.photoPath ? (
          <img src={`${apiUrl}/uploads/scouts/${scout.photoPath?.split('/').pop()}`} alt="Scout" style={{ width: '52px', height: '64px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.3)' }} />
        ) : (
          <div style={{ width: '52px', height: '64px', borderRadius: '4px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
            👤
          </div>
        )}
        <div style={{ fontSize: '5.5px', color: '#FCD34D', fontWeight: 700, textAlign: 'center', fontFamily: 'monospace' }}>
          {scout.registrationNumber}
        </div>
      </div>

      <div style={{ flex: 1, color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '5px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
            {programName ?? 'Annual Scouts Program 2024'}
          </div>
          <div style={{ fontSize: '8px', fontWeight: 700, lineHeight: 1.2, marginBottom: '4px' }}>{scout.fullName}</div>
          <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.8)', marginBottom: '1px' }}>Father: {scout.fatherName}</div>
          <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.8)', marginBottom: '1px' }}>Unit: {scout.unitName}</div>
          <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.8)' }}>{scout.city} · {scout.area}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '5px', color: 'rgba(255,255,255,0.6)' }}>Blood Group</div>
            <div style={{ fontSize: '8px', fontWeight: 700, color: '#FCD34D' }}>{formatBloodGroup(scout.bloodGroup)}</div>
          </div>
          <div style={{ background: 'white', padding: '2px', borderRadius: '2px' }}>
            <QRCode value={scout.registrationNumber} size={32} />
          </div>
        </div>
      </div>
    </div>
  );
}

function IDCardBack({ scout }: { scout: ScoutDTO }) {
  return (
    <div style={{ width: '85.6mm', height: '53.98mm', background: 'white', border: '1px solid #1E3A5F', borderRadius: '6px', padding: '8px', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ fontSize: '6px', fontWeight: 700, color: '#1E3A5F', textAlign: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
        SCOUTS DUTY MANAGEMENT SYSTEM
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '6px', color: '#64748B', marginBottom: '2px' }}>Emergency Contact</div>
          <div style={{ fontSize: '7px', fontWeight: 600, color: '#1E293B', fontFamily: 'monospace' }}>{scout.emergencyContact}</div>
          <div style={{ fontSize: '6px', color: '#64748B', marginTop: '4px', marginBottom: '2px' }}>Registered</div>
          <div style={{ fontSize: '7px', fontWeight: 600, color: '#1E293B' }}>{formatDate(scout.registeredAt)}</div>
          <div style={{ fontSize: '5px', color: '#94A3B8', marginTop: '6px', lineHeight: 1.4 }}>
            This card must be carried during duty. Loss of card must be reported immediately.
          </div>
        </div>
        <div style={{ background: '#F8FAFC', padding: '4px', borderRadius: '4px', textAlign: 'center' }}>
          <QRCode value={`${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/scouts/${scout.id}`} size={48} />
          <div style={{ fontSize: '5px', color: '#94A3B8', marginTop: '2px' }}>Scan to verify</div>
        </div>
      </div>
      <div style={{ fontSize: '5px', color: '#1E3A5F', textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '4px' }}>
        Annual Scouts Program 2024 · If found, please return to Scout HQ
      </div>
    </div>
  );
}

export function IDCard({ scout, programName }: IDCardProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `ID-Card-${scout.registrationNumber}`,
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition"
        >
          <Printer className="w-4 h-4" /> Print ID Card
        </button>
      </div>

      <div ref={printRef} className="flex flex-col gap-2 print-only-show" style={{ width: 'fit-content' }}>
        <IDCardFront scout={scout} programName={programName} />
        <IDCardBack scout={scout} />
      </div>

      <div className="flex flex-col gap-3" style={{ width: 'fit-content' }}>
        <div className="shadow-lg">
          <IDCardFront scout={scout} programName={programName} />
        </div>
        <div className="shadow-lg">
          <IDCardBack scout={scout} />
        </div>
      </div>
    </div>
  );
}
