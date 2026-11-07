import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileCheck, 
  MessageSquareQuote, 
  Flag, 
  Calendar, 
  Activity, 
  Lock, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  CheckCircle2,
  RefreshCw,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { Profile, VerificationRequest, Confession, UserReport, AuditLog } from '../types';

interface AdminDashboardProps {
  currentUser: Profile;
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'users' | 'confessions' | 'reports' | 'audit'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      const [oRes, uRes, vRes, cRes, rRes, aRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getAdminVerifications(),
        api.getAdminConfessions(),
        api.getAdminReports(),
        api.getAdminAuditLogs()
      ]);
      setOverview(oRes);
      setUsers(uRes.users || []);
      setVerifications(vRes.requests || []);
      setConfessions(cRes.confessions || []);
      setReports(rRes.reports || []);
      setAuditLogs(aRes.auditLogs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerificationDecision = async (id: string, decision: 'approved' | 'rejected') => {
    try {
      await api.decideVerification(id, decision, decision === 'approved' ? 'Verified against university records' : 'Invalid document');
      setActionNotice(`Verification request ${decision}.`);
      loadAdminData();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfessionDecision = async (id: string, decision: 'approved' | 'rejected' | 'hidden') => {
    try {
      await api.decideConfession(id, decision);
      setActionNotice(`Confession ${decision}.`);
      loadAdminData();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserStatus = async (userId: string, status: string) => {
    try {
      await api.updateUserStatus(userId, status);
      setActionNotice(`User account status updated to ${status}.`);
      loadAdminData();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    const action = prompt('Enter resolution action note (e.g. Warning issued, Content moderated):', 'Resolved after review.');
    if (!action) return;
    try {
      await api.resolveReport(reportId, action);
      setActionNotice('Report resolved.');
      loadAdminData();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#f3f4f6]">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#151a25] to-[#1d2636] border border-[#d9b978]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#d9b978] font-mono font-bold mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Campus Administrative Portal (Super Admin)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f3f4f6]">
            AFTERCLASS Administration
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            Student safety oversight, enrollment verification queue, content moderation, and audit logs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 bg-[#101827] hover:bg-[#1d2636] text-xs font-semibold text-[#d9b978] rounded-xl border border-[#2b3548] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-[#4ade80]/15 border border-[#4ade80]/30 text-xs text-[#4ade80] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1d2636] pb-2 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: Activity },
          { id: 'verifications', label: `Verifications (${overview?.pendingVerifications || 0})`, icon: FileCheck },
          { id: 'confessions', label: `Confession Moderation (${overview?.pendingConfessions || 0})`, icon: MessageSquareQuote },
          { id: 'users', label: 'Student Accounts', icon: Users },
          { id: 'reports', label: `Safety Reports (${overview?.openReports || 0})`, icon: Flag },
          { id: 'audit', label: 'Audit Trail', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#1d2636] text-[#d9b978] font-bold border border-[#2b3548]'
                  : 'text-[#9ca3af] hover:text-[#f3f4f6]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW METRICS */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-1">
              <span className="text-[11px] text-[#9ca3af] block">Total Registered</span>
              <span className="text-3xl font-mono font-bold text-[#f3f4f6]">{overview.totalUsers}</span>
              <span className="text-[10px] text-[#4ade80] block">Enrolled students</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-1">
              <span className="text-[11px] text-[#9ca3af] block">Verified Status</span>
              <span className="text-3xl font-mono font-bold text-[#4ade80]">{overview.verifiedUsers}</span>
              <span className="text-[10px] text-[#9ca3af] block">Enrolment confirmed</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-1">
              <span className="text-[11px] text-[#9ca3af] block">Pending Verifications</span>
              <span className="text-3xl font-mono font-bold text-[#d9b978]">{overview.pendingVerifications}</span>
              <span className="text-[10px] text-[#9ca3af] block">Action required</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-1">
              <span className="text-[11px] text-[#9ca3af] block">Open Reports</span>
              <span className="text-3xl font-mono font-bold text-[#f87171]">{overview.openReports}</span>
              <span className="text-[10px] text-[#9ca3af] block">Under investigation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-3">
              <h3 className="text-sm font-bold text-[#f3f4f6]">Safety & Privacy Guidelines Enforcement</h3>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                As a student administrator, all moderation actions must be objective, respectful, and logged in the immutable audit trail. Never disclose confidential anonymous identities unless resolving verified criminal conduct with university authority.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-3">
              <h3 className="text-sm font-bold text-[#f3f4f6]">Automated AI Flagging</h3>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Gemini AI performs automated background checks on all confession submissions. Submissions containing phone numbers, commercial promos, or harassment indicators are routed directly to the pending moderation queue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. VERIFICATIONS QUEUE */}
      {activeTab === 'verifications' && (
        <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#f3f4f6]">Pending Student Verifications</h3>
            <span className="text-xs text-[#9ca3af]">{verifications.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2b3548] text-[#9ca3af] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-2">Student Name</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Branch / Year</th>
                  <th className="py-3 px-2">Roll Number</th>
                  <th className="py-3 px-2">Method</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1d2636]">
                {verifications.map((vr) => (
                  <tr key={vr.id} className="hover:bg-[#101827]">
                    <td className="py-3 px-2 font-semibold text-[#f3f4f6]">{vr.student_name}</td>
                    <td className="py-3 px-2 text-[#9ca3af]">{vr.email}</td>
                    <td className="py-3 px-2 text-[#9ca3af]">{vr.branch.split(' ')[0]} · {vr.academic_year}</td>
                    <td className="py-3 px-2 font-mono text-[#d9b978]">{vr.roll_number || 'N/A'}</td>
                    <td className="py-3 px-2 text-[#9ca3af] capitalize">{vr.verification_method.replace('_', ' ')}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        vr.status === 'approved' ? 'bg-[#4ade80]/15 text-[#4ade80]' :
                        vr.status === 'pending' ? 'bg-[#d9b978]/15 text-[#d9b978]' : 'bg-[#f87171]/15 text-[#f87171]'
                      }`}>
                        {vr.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {vr.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleVerificationDecision(vr.id, 'approved')}
                            className="p-1.5 rounded-lg bg-[#4ade80]/20 text-[#4ade80] hover:bg-[#4ade80] hover:text-[#101827] transition-colors"
                            title="Approve student"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleVerificationDecision(vr.id, 'rejected')}
                            className="p-1.5 rounded-lg bg-[#f87171]/20 text-[#f87171] hover:bg-[#f87171] hover:text-white transition-colors"
                            title="Reject document"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CONFESSIONS MODERATION */}
      {activeTab === 'confessions' && (
        <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#f3f4f6]">Confessions Moderation Queue</h3>
            <span className="text-xs text-[#9ca3af]">{confessions.length} total posts</span>
          </div>

          <div className="space-y-3">
            {confessions.map((conf) => (
              <div key={conf.id} className="p-4 rounded-xl bg-[#101827] border border-[#2b3548] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#e879a9]">{conf.category}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      conf.status === 'approved' ? 'bg-[#4ade80]/15 text-[#4ade80]' :
                      conf.status === 'pending' ? 'bg-[#d9b978]/15 text-[#d9b978]' : 'bg-[#f87171]/15 text-[#f87171]'
                    }`}>
                      {conf.status}
                    </span>
                    {conf.ai_moderation_flagged && (
                      <span className="text-[10px] text-[#f87171] bg-[#f87171]/10 px-2 py-0.5 rounded">
                        AI Flagged
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#9ca3af]">
                    {new Date(conf.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#f3f4f6] leading-relaxed italic">
                  "{conf.content}"
                </p>

                {conf.ai_moderation_reason && (
                  <p className="text-[11px] text-[#f87171] bg-[#f87171]/10 p-2 rounded-lg">
                    Flag Reason: {conf.ai_moderation_reason}
                  </p>
                )}

                <div className="pt-2 border-t border-[#1d2636] flex items-center justify-end gap-2 text-xs">
                  {conf.status !== 'approved' && (
                    <button
                      onClick={() => handleConfessionDecision(conf.id, 'approved')}
                      className="px-3 py-1 bg-[#4ade80] text-[#101827] font-semibold rounded-lg text-xs"
                    >
                      Approve & Publish
                    </button>
                  )}
                  {conf.status !== 'rejected' && (
                    <button
                      onClick={() => handleConfessionDecision(conf.id, 'rejected')}
                      className="px-3 py-1 bg-[#f87171]/20 text-[#f87171] hover:bg-[#f87171] hover:text-white rounded-lg text-xs font-semibold"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. USER ACCOUNTS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#f3f4f6]">Student Directory</h3>
            <span className="text-xs text-[#9ca3af]">{users.length} enrolled users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2b3548] text-[#9ca3af] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-2">Student</th>
                  <th className="py-3 px-2">Branch / Year</th>
                  <th className="py-3 px-2">Roll No</th>
                  <th className="py-3 px-2">Account Status</th>
                  <th className="py-3 px-2 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1d2636]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#101827]">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatar_url || 'https://placehold.co/100'}
                          alt={u.display_name}
                          className="w-7 h-7 rounded-full object-cover border border-[#2b3548]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-semibold text-[#f3f4f6] block">{u.full_name}</span>
                          <span className="text-[10px] text-[#9ca3af]">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-[#9ca3af]">{u.branch.split(' ')[0]} · {u.academic_year}</td>
                    <td className="py-3 px-2 font-mono text-[#d9b978]">{u.roll_number || '210101099'}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.account_status === 'verified' ? 'bg-[#4ade80]/15 text-[#4ade80]' :
                        u.account_status === 'suspended' ? 'bg-[#f87171]/15 text-[#f87171]' : 'bg-[#d9b978]/15 text-[#d9b978]'
                      }`}>
                        {u.account_status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {u.account_status === 'suspended' ? (
                        <button
                          onClick={() => handleUserStatus(u.id, 'verified')}
                          className="px-2.5 py-1 text-xs text-[#4ade80] hover:underline font-semibold"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserStatus(u.id, 'suspended')}
                          className="px-2.5 py-1 text-xs text-[#f87171] hover:underline font-semibold"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SAFETY & ABUSE REPORTS */}
      {activeTab === 'reports' && (
        <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#f3f4f6]">Safety & Abuse Reports</h3>
            <span className="text-xs text-[#9ca3af]">{reports.length} reports logged</span>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div key={rep.id} className="p-4 rounded-xl bg-[#101827] border border-[#2b3548] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#f87171]">{rep.reason}</span>
                    <span className="text-[10px] text-[#9ca3af]">Target: {rep.target_type}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rep.status === 'resolved' ? 'bg-[#4ade80]/15 text-[#4ade80]' : 'bg-[#f87171]/15 text-[#f87171]'
                  }`}>
                    {rep.status}
                  </span>
                </div>

                {rep.details && (
                  <p className="text-xs text-[#9ca3af]">"{rep.details}"</p>
                )}

                {rep.action_taken && (
                  <p className="text-xs text-[#4ade80] bg-[#4ade80]/10 p-2 rounded-lg">
                    Resolution: {rep.action_taken}
                  </p>
                )}

                {rep.status !== 'resolved' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleResolveReport(rep.id)}
                      className="px-3.5 py-1.5 bg-[#d9b978] text-[#101827] font-semibold text-xs rounded-xl"
                    >
                      Take Moderation Action
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. IMMUTABLE AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#f3f4f6]">Immutable Administrative Audit Log</h3>
            <span className="text-xs text-[#9ca3af]">{auditLogs.length} entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2b3548] text-[#9ca3af] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-2">Timestamp</th>
                  <th className="py-3 px-2">Administrator</th>
                  <th className="py-3 px-2">Action Type</th>
                  <th className="py-3 px-2">Target Table</th>
                  <th className="py-3 px-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1d2636] font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#101827]">
                    <td className="py-2.5 px-2 text-[#9ca3af]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 text-[#f3f4f6] font-sans font-semibold">
                      {log.admin_name}
                    </td>
                    <td className="py-2.5 px-2 text-[#d9b978]">
                      {log.action_type}
                    </td>
                    <td className="py-2.5 px-2 text-[#9ca3af]">
                      {log.target_table}
                    </td>
                    <td className="py-2.5 px-2 text-[#9ca3af] font-sans max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
