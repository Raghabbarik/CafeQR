import React, { useState, useEffect } from 'react';
import type { CafeInfo, StaffMember } from '../../types';
import { api } from '../../services/api';
import {
  Users,
  UserPlus,
  Trash2,
  Tv,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  UtensilsCrossed
} from 'lucide-react';

interface StaffManagerViewProps {
  cafe: CafeInfo;
  onRefreshCafe?: () => void;
}

export const StaffManagerView: React.FC<StaffManagerViewProps> = ({ cafe }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>(cafe.staff || []);
  const [displayCode, setDisplayCode] = useState<string>(cafe.orderDisplayCode || '8899');
  
  // Add Staff Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [staffSuccessMsg, setStaffSuccessMsg] = useState('');
  const [staffErrorMsg, setStaffErrorMsg] = useState('');

  // TV Code State
  const [newCode, setNewCode] = useState(cafe.orderDisplayCode || '8899');
  const [isSavingCode, setIsSavingCode] = useState(false);
  const [codeSuccessMsg, setCodeSuccessMsg] = useState('');
  const [codeErrorMsg, setCodeErrorMsg] = useState('');

  // Load initial staff from backend
  useEffect(() => {
    api.getStaffList()
      .then((list) => {
        if (Array.isArray(list)) setStaffList(list);
      })
      .catch((e) => console.error('Error fetching staff list:', e));

    api.getOrderDisplayCode()
      .then((code) => {
        if (code) {
          setDisplayCode(code);
          setNewCode(code);
        }
      })
      .catch((e) => console.error('Error fetching display code:', e));
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffErrorMsg('');
    setStaffSuccessMsg('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setStaffErrorMsg('Please fill in staff name, email, and password.');
      return;
    }

    if (password.length < 4) {
      setStaffErrorMsg('Password should be at least 4 characters long.');
      return;
    }

    setIsAddingStaff(true);
    try {
      const updated = await api.addStaff({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      setStaffList(updated);
      setName('');
      setEmail('');
      setPassword('');
      setStaffSuccessMsg(`Staff member "${name}" assigned successfully! They can log in at /staff.`);
      setTimeout(() => setStaffSuccessMsg(''), 5000);
    } catch (err: any) {
      setStaffErrorMsg(err.message || 'Failed to assign staff.');
    } finally {
      setIsAddingStaff(false);
    }
  };

  const handleDeleteStaff = async (id: string, staffName: string) => {
    if (!confirm(`Are you sure you want to remove staff member "${staffName}"?`)) {
      return;
    }

    try {
      const updated = await api.deleteStaff(id);
      setStaffList(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to delete staff member.');
    }
  };

  const handleSaveDisplayCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeErrorMsg('');
    setCodeSuccessMsg('');

    if (!newCode.trim()) {
      setCodeErrorMsg('Display Access Code cannot be empty.');
      return;
    }

    setIsSavingCode(true);
    try {
      const saved = await api.updateOrderDisplayCode(newCode.trim());
      setDisplayCode(saved);
      setCodeSuccessMsg('TV Display Access Code updated successfully!');
      setTimeout(() => setCodeSuccessMsg(''), 4000);
    } catch (err: any) {
      setCodeErrorMsg(err.message || 'Failed to update access code.');
    } finally {
      setIsSavingCode(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner Info */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Staff & Displays
              </span>
              <span className="text-xs text-stone-400">Role-Based Access Control</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Staff Accounts & TV Screen Status Board
            </h2>
            <p className="text-sm text-stone-400 max-w-2xl">
              Assign staff members to manage live orders and menu inventory only. Configure the secure PIN code for customer-facing TV screens.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/staff"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              Open Staff Login (/staff)
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <a
              href="/orderdisplay"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Tv className="w-4 h-4" />
              Open TV Screen (/orderdisplay)
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: STAFF MANAGEMENT (8 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Add Staff Form */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">Assign New Staff</h3>
                <p className="text-xs text-stone-500">
                  Staff can only manage kitchen orders and menu availability
                </p>
              </div>
            </div>

            {staffSuccessMsg && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{staffSuccessMsg}</span>
              </div>
            )}

            {staffErrorMsg && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{staffErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Staff Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700">
                    Staff Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Staff Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700">
                    Login Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="staff@cafe.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Staff Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  Assign Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter login password for staff"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-500">
                  The staff member will use this email & password to sign in at <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-stone-800">/staff</code>
                </p>
              </div>

              {/* Permissions note */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Staff Role Restricted:</span> Staff accounts can update live order statuses (preparing, ready, delivered) and toggle menu stock. They cannot access revenue, settings, or staff accounts.
                </div>
              </div>

              <button
                type="submit"
                disabled={isAddingStaff}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isAddingStaff ? (
                  <span>Assigning Staff...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Assign & Save Staff Account</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Current Staff List */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-stone-700" />
                <h3 className="font-extrabold text-stone-900 text-sm">Active Staff Accounts</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md">
                {staffList.length} Active
              </span>
            </div>

            {staffList.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-stone-200 rounded-xl">
                <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-700">No Staff Assigned Yet</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Use the form above to add kitchen or floor staff members.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {staffList.map((member) => (
                  <div
                    key={member.id}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/60 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-stone-900 truncate">{member.name}</p>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            <UtensilsCrossed className="w-2.5 h-2.5" />
                            Orders & Menu
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteStaff(member.id, member.name)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove staff account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: TV DISPLAY CODE CONFIG (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">TV Order Display Screen</h3>
                <p className="text-xs text-stone-500">
                  Secured TV screen showing live customer order statuses
                </p>
              </div>
            </div>

            {codeSuccessMsg && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{codeSuccessMsg}</span>
              </div>
            )}

            {codeErrorMsg && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{codeErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveDisplayCode} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  TV Screen Access PIN Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8899"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-black tracking-widest text-stone-900 transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-stone-500">
                  When anyone opens <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-stone-800">/orderdisplay</code>, they must type this PIN to unlock the screen.
                </p>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  Current PIN Code
                </div>
                <div className="text-2xl font-black text-stone-900 tracking-widest font-mono">
                  {displayCode || '8899'}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingCode}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isSavingCode ? (
                  <span>Saving PIN...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Update TV Access PIN</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-stone-100 space-y-3">
              <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                How to setup TV in Cafe:
              </h4>
              <ol className="text-xs text-stone-600 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Connect any Smart TV, Tablet, or FireStick browser to your cafe Wi-Fi.</li>
                <li>Navigate to <span className="font-mono font-bold text-stone-800">/orderdisplay</span>.</li>
                <li>Enter the PIN <span className="font-mono font-bold text-emerald-700">{displayCode || '8899'}</span> to unlock.</li>
                <li>Press <span className="font-bold text-stone-800">Fullscreen</span> — new orders and status changes update automatically with audio chimes!</li>
              </ol>

              <div className="pt-2">
                <a
                  href="/orderdisplay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Tv className="w-4 h-4 text-emerald-600" />
                  <span>Preview TV Display Board</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

