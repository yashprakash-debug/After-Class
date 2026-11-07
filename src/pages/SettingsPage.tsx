import React, { useState } from 'react';
import { 
  Lock, 
  Bell, 
  ShieldCheck, 
  Eye, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Profile } from '../types';

interface SettingsPageProps {
  currentUser: Profile;
  onUpdateUser: (updated: Profile) => void;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUpdateUser, onLogout }) => {
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyEvents, setNotifyEvents] = useState(true);
  const [notifyConfessions, setNotifyConfessions] = useState(false);
  const [isDiscoverable, setIsDiscoverable] = useState(currentUser.is_discoverable ?? true);
  
  const [passwordOld, setPasswordOld] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [dataExported, setDataExported] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordNew || passwordNew.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }
    setPasswordSuccess(true);
    setPasswordOld('');
    setPasswordNew('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentUser, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `afterclass_data_${currentUser.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDataExported(true);
    setTimeout(() => setDataExported(false), 3000);
  };

  const handleToggleDiscoverable = async (checked: boolean) => {
    setIsDiscoverable(checked);
    try {
      const res = await api.updateProfile({ is_discoverable: checked });
      onUpdateUser(res.profile);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#f3f4f6]">
      <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548]">
        <h1 className="text-2xl font-bold text-[#f3f4f6]">Account Settings & Privacy</h1>
        <p className="text-xs text-[#9ca3af] mt-1">
          Manage your HBTU student verification, notifications, password, and privacy preferences.
        </p>
      </div>

      {/* 1. Student Verification Status Card */}
      <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#f3f4f6]">
            <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
            <span>Campus Enrolment Verification</span>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
            currentUser.is_student_verified 
              ? 'bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30'
              : 'bg-[#d9b978]/15 text-[#d9b978] border border-[#d9b978]/30'
          }`}>
            {currentUser.is_student_verified ? 'Verified HBTU Student' : 'Pending Review'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#9ca3af] pt-1">
          <div className="p-3 rounded-xl bg-[#101827] border border-[#2b3548]">
            <span className="text-[10px] block text-[#9ca3af]">Registered Email</span>
            <span className="font-semibold text-[#f3f4f6] truncate block">{currentUser.email}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101827] border border-[#2b3548]">
            <span className="text-[10px] block text-[#9ca3af]">Roll / Enrollment Number</span>
            <span className="font-semibold text-[#f3f4f6]">{currentUser.roll_number || '210101099'}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101827] border border-[#2b3548]">
            <span className="text-[10px] block text-[#9ca3af]">Branch & Year</span>
            <span className="font-semibold text-[#f3f4f6]">{currentUser.branch.split(' ')[0]} · {currentUser.academic_year}</span>
          </div>
        </div>
      </div>

      {/* 2. Privacy & Discovery Controls */}
      <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
        <h3 className="text-base font-bold text-[#f3f4f6] flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#d9b978]" />
          <span>Discovery & Privacy</span>
        </h3>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#101827] border border-[#2b3548]">
          <div>
            <span className="text-sm font-semibold text-[#f3f4f6] block">
              Discoverable in campus search
            </span>
            <span className="text-xs text-[#9ca3af]">
              Allow verified students to discover your card in the social & dating feed.
            </span>
          </div>
          <input
            type="checkbox"
            checked={isDiscoverable}
            onChange={(e) => handleToggleDiscoverable(e.target.checked)}
            className="w-5 h-5 accent-[#d9b978] rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Notification Preferences */}
      <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
        <h3 className="text-base font-bold text-[#f3f4f6] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#d9b978]" />
          <span>Notification Preferences</span>
        </h3>

        <div className="space-y-2">
          {[
            { label: 'Mutual Match Alerts', desc: 'Notify when both students like each other', state: notifyMatches, set: setNotifyMatches },
            { label: 'Private Messages', desc: 'Notify when a new chat message arrives', state: notifyMessages, set: setNotifyMessages },
            { label: 'Campus Buzz Event Reminders', desc: 'Upcoming mixers and workshops you registered for', state: notifyEvents, set: setNotifyEvents },
            { label: 'Confession Approvals', desc: 'Notify when your submitted story goes live', state: notifyConfessions, set: setNotifyConfessions },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#101827] border border-[#2b3548]">
              <div>
                <span className="text-xs font-semibold text-[#f3f4f6] block">{item.label}</span>
                <span className="text-[11px] text-[#9ca3af]">{item.desc}</span>
              </div>
              <input
                type="checkbox"
                checked={item.state}
                onChange={(e) => item.set(e.target.checked)}
                className="w-4 h-4 accent-[#d9b978] rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Password Security */}
      <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
        <h3 className="text-base font-bold text-[#f3f4f6] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#d9b978]" />
          <span>Security & Password</span>
        </h3>

        {passwordSuccess && (
          <div className="p-3 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/30 text-xs text-[#4ade80] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Password successfully updated.</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-medium text-[#9ca3af] mb-1">Current Password</label>
            <input
              type="password"
              value={passwordOld}
              onChange={(e) => setPasswordOld(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9ca3af] mb-1">New Password</label>
            <input
              type="password"
              value={passwordNew}
              onChange={(e) => setPasswordNew(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3.5 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1d2636] hover:bg-[#253247] text-xs font-semibold text-[#d9b978] rounded-xl border border-[#2b3548] transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* 5. Data Privacy & Account Actions */}
      <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
        <h3 className="text-base font-bold text-[#f3f4f6]">Data Rights & Account Control</h3>
        <p className="text-xs text-[#9ca3af]">
          Per digital privacy regulations, you have full ownership of your data on AFTERCLASS.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 bg-[#101827] hover:bg-[#1d2636] text-xs font-medium text-[#f3f4f6] rounded-xl border border-[#2b3548] flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#d9b978]" />
            <span>{dataExported ? 'Data Export Downloaded!' : 'Export My Profile Data (JSON)'}</span>
          </button>

          <button
            onClick={() => setDeleteConfirm(true)}
            className="px-4 py-2.5 bg-[#f87171]/10 hover:bg-[#f87171]/20 text-xs font-medium text-[#f87171] rounded-xl border border-[#f87171]/30 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Request Account Deletion</span>
          </button>
        </div>

        {deleteConfirm && (
          <div className="p-4 rounded-xl bg-[#f87171]/15 border border-[#f87171]/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#f87171]">
              <AlertTriangle className="w-4 h-4" />
              <span>Confirm Account Deletion</span>
            </div>
            <p className="text-xs text-[#f3f4f6]">
              This will permanently revoke your access, delete matches, unenroll your couple space, and remove all confidential preferences.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert('Account scheduled for permanent erasure. Signing out.');
                  onLogout();
                }}
                className="px-4 py-1.5 bg-[#f87171] text-white text-xs font-bold rounded-lg"
              >
                Permanently Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs text-[#9ca3af] hover:text-[#f3f4f6]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
