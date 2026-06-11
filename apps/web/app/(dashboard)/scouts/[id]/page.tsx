'use client';

import { useScout } from '@/lib/api/scouts';
import { IDCard } from '@/components/id-card/IDCard';
import { SkeletonTable } from '@/components/shared/SkeletonTable';
import { formatDate, formatBloodGroup, formatCurrency } from '@/lib/utils/format';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Tab = 'info' | 'duty' | 'items' | 'fines' | 'id-card';

export default function ScoutProfilePage({ params }: { params: { id: string } }) {
  const { data: scout, isLoading } = useScout(params.id);
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const TABS: { key: Tab; label: string }[] = [
    { key: 'info', label: 'Personal Info' },
    { key: 'duty', label: 'Duty Assignment' },
    { key: 'items', label: 'Issued Items' },
    { key: 'fines', label: 'Fines' },
    { key: 'id-card', label: 'ID Card' },
  ];

  if (isLoading) return <SkeletonTable rows={6} cols={3} />;
  if (!scout) return <p className="text-slate-500">Scout not found.</p>;

  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/scouts" className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{scout.fullName}</h1>
          <p className="text-sm font-mono text-slate-500">{scout.registrationNumber}</p>
        </div>
        {scout.photoPath && (
          <img src={`${apiUrl}${scout.photoPath}`} alt="Scout" className="w-14 h-14 rounded-full object-cover border-2 border-primary-200 ml-auto" />
        )}
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex gap-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${activeTab === key ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 text-sm">
            {[
              ["Father's Name", scout.fatherName],
              ['CNIC / B-Form', scout.cnicOrBForm],
              ['Contact', scout.contactNumber],
              ['Emergency', scout.emergencyContact],
              ['City', scout.city],
              ['Area', scout.area],
              ['Unit', scout.unitName],
              ['Age', String(scout.age)],
              ['Blood Group', formatBloodGroup(scout.bloodGroup)],
              ['Experience', scout.hasPreviousExperience ? 'Yes' : 'No'],
              ['Registered', formatDate(scout.registeredAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="font-medium text-slate-900 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'duty' && (
          <div>
            {((scout as unknown as { dutyAssignments: unknown[] }).dutyAssignments ?? []).length === 0 ? (
              <p className="text-slate-500 text-sm">No duty assignments yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Department', 'Gate', 'Shift', 'Reporting Time', 'Incharge', 'Date'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {((scout as unknown as { dutyAssignments: Array<{ id: string; department: { name: string }; gateName: string; shift: string; reportingTime: string; inchargeName: string; assignedAt: string }> }).dutyAssignments ?? []).map((d) => (
                    <tr key={d.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{d.department?.name}</td>
                      <td className="px-3 py-2">{d.gateName}</td>
                      <td className="px-3 py-2">{d.shift}</td>
                      <td className="px-3 py-2">{d.reportingTime}</td>
                      <td className="px-3 py-2">{d.inchargeName}</td>
                      <td className="px-3 py-2">{formatDate(d.assignedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'items' && (
          <div>
            {((scout as unknown as { issuedItems: unknown[] }).issuedItems ?? []).length === 0 ? (
              <p className="text-slate-500 text-sm">No items issued yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Tag #', 'Item', 'Category', 'Issued', 'Returned', 'Status'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {((scout as unknown as { issuedItems: Array<{ id: string; inventoryItem: { tagNumber: string; name: string; category: { name: string } }; issuedAt: string; returnedAt: string | null; returnCondition: string | null }> }).issuedItems ?? []).map((item) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-mono text-xs">{item.inventoryItem?.tagNumber}</td>
                      <td className="px-3 py-2">{item.inventoryItem?.name}</td>
                      <td className="px-3 py-2">{item.inventoryItem?.category?.name}</td>
                      <td className="px-3 py-2">{formatDate(item.issuedAt)}</td>
                      <td className="px-3 py-2">{item.returnedAt ? formatDate(item.returnedAt) : '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.returnedAt ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.returnedAt ? item.returnCondition ?? 'Returned' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'fines' && (
          <div>
            {((scout as unknown as { fines: unknown[] }).fines ?? []).length === 0 ? (
              <p className="text-slate-500 text-sm">No fines on record.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Amount', 'Status', 'Date'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {((scout as unknown as { fines: Array<{ id: string; fineAmount: number; status: string; createdAt: string }> }).fines ?? []).map((fine) => (
                    <tr key={fine.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium">{formatCurrency(fine.fineAmount)}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fine.status === 'PAID' ? 'bg-green-100 text-green-700' : fine.status === 'WAIVED' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'}`}>
                          {fine.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{formatDate(fine.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'id-card' && (
          <IDCard scout={scout} programName={process.env['NEXT_PUBLIC_PROGRAM_NAME']} />
        )}
      </div>
    </div>
  );
}
