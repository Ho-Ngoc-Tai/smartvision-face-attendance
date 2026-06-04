'use client';

import React, { useState } from 'react';

interface HistoryRecord {
  id: string;
  studentId: string;
  name: string;
  avatar: string;
  scanTime: string;
  location: string;
  status: 'Present' | 'Late' | 'Absent';
  confidence: number | null;
  department: string;
}

const INITIAL_RECORDS: HistoryRecord[] = [
  {
    id: '1',
    studentId: 'CS-2023-001',
    name: 'Marcus Thorne',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx0PuwT7IPmY_td5CEcVhI9ZFNK_Dl49gLF4y6FSpam8gBGgzyiexSc3S2s1aYlbfXV1YJqGvBn5x5-pZOBGYSr6pYzqduBSskKRSOSaz5rSwCOaJl3FzLVbpelJeISdjEetNyzkl6Wl8bScIWpwoMoaTvQaRMaeK9q7WnP76gPEmjam0GdGmI52gOG6yKei7hzzg4My7vLSP9fo4hleU9oqYtHEBcpRjOLTq70TbJ008ip-Fl41apAP9qSNLOYhvOEt6NQyZ3rV4',
    scanTime: '08:42:15 AM',
    location: 'Main Entrance Cam-01',
    status: 'Present',
    confidence: 0.98,
    department: 'Computer Science',
  },
  {
    id: '2',
    studentId: 'EE-2023-042',
    name: 'Elena Rodriguez',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBGaKAfPLe9viawha8qnssjUpkyfyIQVz25HVlMo_pIBhR6diFExzO484qdk44ILltlzgQRZSXG7NIgZsgcMCye7y__XFnfMyO1UPva_m-MHb_FE8DHIfUi9LyiZuPwvY7KLG3KXSDR2QFtkDBQsvERVv27UdO4Jv54VaAIF_AicpEYsxzxRMh9sOBxEyi5wAX0RPNMQN6l_73Jf1u6suCT3gAm0TG1cX9XOl6i9MXeORtarvxaCU8VGopusbQz1ztLGTJ14B5AEk',
    scanTime: '09:15:22 AM',
    location: 'Side Gate Cam-04',
    status: 'Late',
    confidence: 0.94,
    department: 'Engineering',
  },
  {
    id: '3',
    studentId: 'ME-2023-115',
    name: 'Julian Drake',
    avatar: '',
    scanTime: 'N/A',
    location: 'N/A',
    status: 'Absent',
    confidence: null,
    department: 'Mathematics',
  },
  {
    id: '4',
    studentId: 'CS-2023-008',
    name: 'Soren Miller',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6EzGkGNE-1_w_Ve5k86XY49exLZbZLIG4-dEna79AR_FF-mPV3MNanG5YU_Q4MThA5SKXB9SxEYxF6FsGfEYqnAxNv1gb_jbGhmMNJpz-rbVPtph-klLjqQajNmEGvV210gwx-fljnMGV1MpSVpk0inqdHszcKAJL4MrQT3uyCW-NlHrr1VpTSSs0Reby5qOVJhJBMAYh3MZdZi3f2dzlc7i6o9iGl1C86akaPPiTfbOqtkIE81TwhqxXJWFbig4I_ALBA1Xi30I',
    scanTime: '08:30:11 AM',
    location: 'Main Entrance Cam-01',
    status: 'Present',
    confidence: 0.99,
    department: 'Computer Science',
  },
  {
    id: '5',
    studentId: 'MT-2023-089',
    name: 'Aria Vance',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxZzO40sZ1byUgGs9IOI4O1I6Z_v8Pkq7aaxNzGdXFkFCR8JMgN_CKsy7xGXu9Tq1NuLFvMiNI71tlzm1OJ26jZ1UPVQvQ7ZRGac94Zfs5Coj7qKxfRTGIzKZpM9mpOhp7-NKwNN4xp4T6CWj3Md85Q_kkvbcsNCQBzkh6QdPzL5kWxfFyMTauHAwEaHPPzlScSGINT3oBu4LqEt5X-0y3u4SPC_pcg-OyAQC1pIA_SLDQtHpYCSmyROpR7VxrKgF2kod1PBIJMl0',
    scanTime: '08:55:40 AM',
    location: 'Lab Hall Cam-07',
    status: 'Present',
    confidence: 0.97,
    department: 'Mathematics',
  },
  {
    id: '6',
    studentId: 'CS-2023-012',
    name: 'Nguyen Van A',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtuQK5IJJs-7oo5u8QZ8vTuorBbDFTx8GtZV6fREXOroaao3jnz74ByjhbS__Qp9ESt5nlS4u0iEaTYf4cTi8UDGFBygobNNybzgWZDRW5Q1HsbXCg9RAkSXihbqARdq5xv5G7RvYoyzU4PTXkNNwkz_hzEHaR2jL3LBIVWcj_0j1shIcNPxVQKVbugHfHVpq-JgG-wTV67us2A74w-dhUawjaUQmWIpEauqMHpTlm2_kyT5llWF66eJCaXrXwBXZHnTFoMsN8cIk',
    scanTime: '08:12:00 AM',
    location: 'Main Entrance Cam-01',
    status: 'Present',
    confidence: 0.98,
    department: 'Computer Science',
  },
];

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>(INITIAL_RECORDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [sortField, setSortField] = useState<'studentId' | 'name' | 'scanTime' | 'confidence'>('studentId');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Xử lý lọc dữ liệu
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      selectedDept === 'All Departments' || rec.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Sắp xếp
  const handleSort = (field: typeof sortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);

    const sorted = [...filteredRecords].sort((a, b) => {
      let valA: any = a[field] ?? '';
      let valB: any = b[field] ?? '';

      if (typeof valA === 'string') {
        return isAsc
          ? valB.localeCompare(valA)
          : valA.localeCompare(valB);
      }
      // Số / null
      return isAsc ? valB - valA : valA - valB;
    });
    setRecords(sorted);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 w-full h-16 px-lg flex justify-between items-center bg-surface border-b border-outline-variant">
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Attendance History</h2>
        <div className="flex items-center gap-lg">
          <div className="relative group">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer active:opacity-80 transition-colors">
              notifications
            </span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer active:opacity-80">
            account_circle
          </span>
        </div>
      </header>

      {/* Main Content Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-lg space-y-lg max-w-[1440px] mx-auto">
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {/* Card 1 */}
            <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-md">
                <span className="font-label-caps text-[11px] text-on-surface-variant font-bold tracking-wider">
                  TOTAL STUDENTS
                </span>
                <div className="p-sm bg-primary-fixed rounded-lg text-on-primary-fixed-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">groups</span>
                </div>
              </div>
              <div>
                <p className="font-display-lg text-display-lg text-primary font-bold">120</p>
                <p className="text-on-surface-variant text-[12px] flex items-center gap-1 mt-xs">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  <span className="font-semibold">+2</span> from last term
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-md">
                <span className="font-label-caps text-[11px] text-on-surface-variant font-bold tracking-wider">
                  PRESENT TODAY
                </span>
                <div className="p-sm bg-secondary-container rounded-lg text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">check_circle</span>
                </div>
              </div>
              <div>
                <p className="font-display-lg text-display-lg text-on-surface font-bold">105</p>
                <div className="w-full bg-surface-container rounded-full h-1.5 mt-sm overflow-hidden">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '87.5%' }}></div>
                </div>
                <p className="text-on-surface-variant text-[12px] mt-xs font-semibold">
                  87.5% Attendance Rate
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-md">
                <span className="font-label-caps text-[11px] text-on-surface-variant font-bold tracking-wider">
                  ABSENT
                </span>
                <div className="p-sm bg-error-container rounded-lg text-on-error-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-error">cancel</span>
                </div>
              </div>
              <div>
                <p className="font-display-lg text-display-lg text-error font-bold">15</p>
                <p className="text-on-surface-variant text-[12px] flex items-center gap-1 mt-xs">
                  <span className="material-symbols-outlined text-[14px]">error_outline</span>
                  <span className="font-semibold">12.5%</span> of total population
                </p>
              </div>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col md:flex-row gap-md justify-between items-end">
            <div className="flex gap-md w-full md:w-auto">
              <div className="flex flex-col gap-1 w-full md:w-56">
                <label className="font-label-caps text-[10px] text-on-surface-variant ml-1 font-bold">
                  DATE RANGE
                </label>
                <div className="relative">
                  <input
                    className="w-full h-10 px-md pr-10 rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md text-on-surface font-medium outline-none"
                    readOnly
                    type="text"
                    value="June 01 - June 07, 2026"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant">
                    calendar_today
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 w-full md:w-56">
                <label className="font-label-caps text-[10px] text-on-surface-variant ml-1 font-bold">
                  DEPARTMENT
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full h-10 px-md rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md text-on-surface font-medium outline-none"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>
            </div>

            <button className="flex items-center gap-sm bg-primary text-on-primary px-lg py-md rounded-lg font-label-caps text-label-caps font-bold hover:bg-primary-container transition-colors active:scale-95 shadow-sm text-xs">
              <span className="material-symbols-outlined">download</span>
              EXPORT REPORT
            </button>
          </div>

          {/* Data Table Section */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h3 className="font-label-caps text-[12px] text-on-surface font-bold tracking-wider">
                HISTORICAL ATTENDANCE LOG
              </h3>
              <div className="relative w-64">
                <input
                  className="w-full h-8 px-8 rounded-full border border-outline-variant bg-white text-body-md focus:border-primary focus:ring-0 outline-none"
                  placeholder="Search records..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="material-symbols-outlined absolute left-2.5 top-1.5 text-on-surface-variant text-[18px]">
                  search
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low/50">
                  <tr>
                    <th
                      onClick={() => handleSort('studentId')}
                      className="px-lg py-md font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase border-b border-outline-variant cursor-pointer select-none font-bold"
                    >
                      ID Number
                      {sortField === 'studentId' && (
                        <span className="material-symbols-outlined text-[14px] ml-1 align-middle">
                          {sortOrder === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down'}
                        </span>
                      )}
                    </th>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-lg py-md font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase border-b border-outline-variant cursor-pointer select-none font-bold"
                    >
                      Student Name
                      {sortField === 'name' && (
                        <span className="material-symbols-outlined text-[14px] ml-1 align-middle">
                          {sortOrder === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down'}
                        </span>
                      )}
                    </th>
                    <th
                      onClick={() => handleSort('scanTime')}
                      className="px-lg py-md font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase border-b border-outline-variant cursor-pointer select-none font-bold"
                    >
                      Scan Time
                      {sortField === 'scanTime' && (
                        <span className="material-symbols-outlined text-[14px] ml-1 align-middle">
                          {sortOrder === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down'}
                        </span>
                      )}
                    </th>
                    <th className="px-lg py-md font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase border-b border-outline-variant font-bold">
                      Device Location
                    </th>
                    <th className="px-lg py-md font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase border-b border-outline-variant text-center font-bold">
                      Status
                    </th>
                    <th
                      onClick={() => handleSort('confidence')}
                      className="px-lg py-md font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase border-b border-outline-variant cursor-pointer select-none font-bold"
                    >
                      Confidence
                      {sortField === 'confidence' && (
                        <span className="material-symbols-outlined text-[14px] ml-1 align-middle">
                          {sortOrder === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down'}
                        </span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((rec) => {
                      return (
                        <tr key={rec.id} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="px-lg py-md font-data-mono text-data-mono text-on-surface-variant font-semibold">
                            {rec.studentId}
                          </td>
                          <td className="px-lg py-md">
                            <div className="flex items-center gap-md">
                              {rec.avatar ? (
                                <img
                                  className="w-8 h-8 rounded-full object-cover border border-outline-variant"
                                  alt={rec.name}
                                  src={rec.avatar}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant text-[10px] font-bold">
                                  {rec.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)}
                                </div>
                              )}
                              <span className="font-semibold text-on-surface">{rec.name}</span>
                            </div>
                          </td>
                          <td className="px-lg py-md text-on-surface-variant font-medium">
                            {rec.scanTime}
                          </td>
                          <td className="px-lg py-md text-on-surface-variant font-medium">
                            {rec.location}
                          </td>
                          <td className="px-lg py-md text-center">
                            <span
                              className={`px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                                rec.status === 'Present'
                                  ? 'status-badge-present'
                                  : rec.status === 'Late'
                                  ? 'status-badge-late'
                                  : 'status-badge-absent'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="px-lg py-md">
                            {rec.confidence ? (
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-surface-container rounded-full h-1 overflow-hidden">
                                  <div
                                    className="bg-primary h-1 rounded-full"
                                    style={{ width: `${rec.confidence * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-[10px] font-bold text-primary">
                                  {Math.round(rec.confidence * 100)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-medium text-on-surface-variant italic">
                                No Record
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-xl text-on-surface-variant font-medium">
                        No attendance records found match search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-lg py-md border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
              <p className="text-[12px] text-on-surface-variant font-semibold">
                Showing {filteredRecords.length} of {records.length} students
              </p>
              <div className="flex items-center gap-sm">
                <button className="p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-50" disabled>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="font-label-caps text-label-caps px-md font-bold text-xs">1 / 1</span>
                <button className="p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-50" disabled>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* System Health Footer */}
          <div className="flex items-center justify-between pt-lg border-t border-outline-variant/30">
            <div className="flex items-center gap-md">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[11px] font-label-caps text-on-surface-variant font-semibold">
                  System Status: Optimal
                </span>
              </div>
              <span className="text-outline-variant opacity-40">|</span>
              <span className="text-[11px] font-label-caps text-on-surface-variant font-semibold">
                Last Synced: Just now
              </span>
            </div>
            <div className="text-[11px] font-label-caps text-on-surface-variant opacity-50 font-bold">
              © 2026 Smart Vision Attendance v4.2.0
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
