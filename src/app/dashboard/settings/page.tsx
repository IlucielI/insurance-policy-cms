'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usersData } from '@/lib/utils/mockData'

type SettingsTab = 'users' | 'organization' | 'email' | 'audit'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('users')
  const [showAddUser, setShowAddUser] = useState(false)
  const [searchUser, setSearchUser] = useState('')

  const filteredUsers = usersData.filter(user =>
    user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.role.toLowerCase().includes(searchUser.toLowerCase())
  )

  const renderUsersTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add User
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.slice(0, 15).map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'Underwriter' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.last_login).toLocaleDateString('id-ID', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Agent</option>
                  <option>Underwriter</option>
                </select>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderOrganizationTab = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Organization Settings</h2>
        <p className="text-gray-600 mt-1">Configure organization-wide settings</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Company Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                defaultValue="PT Asuransi Indonesia"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
              <input
                type="text"
                defaultValue="INS-2024-001234"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                defaultValue="contact@insurance.com"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                defaultValue="+62 21 1234 5678"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                rows={3}
                defaultValue="Jl. Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Changes
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Business Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <div className="font-medium">Auto-approve policies under threshold</div>
                <div className="text-sm text-gray-600">Automatically approve policies below IDR 100M</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <div className="font-medium">Require document verification</div>
                <div className="text-sm text-gray-600">Mandatory document upload for all applications</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">Enable AI underwriting assistance</div>
                <div className="text-sm text-gray-600">Use AI to assist underwriters in decision making</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEmailTab = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Email Configuration</h2>
        <p className="text-gray-600 mt-1">Configure SMTP and email templates</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">SMTP Settings</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
              <input
                type="text"
                defaultValue="smtp.gmail.com"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
              <input
                type="number"
                defaultValue="587"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                defaultValue="noreply@insurance.com"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                defaultValue="••••••••••"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
              <input
                type="text"
                defaultValue="PT Asuransi Indonesia"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save SMTP Settings
            </button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Test Connection
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Email Templates</h3>
          <div className="space-y-3">
            {[
              'Policy Approved',
              'Policy Rejected',
              'Claim Submitted',
              'Claim Approved',
              'Payment Reminder',
              'Welcome Email'
            ].map((template) => (
              <div key={template} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div>
                  <div className="font-medium">{template}</div>
                  <div className="text-sm text-gray-600">Last modified: 2 days ago</div>
                </div>
                <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Edit Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderAuditTab = () => {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [filterUser, setFilterUser] = useState('')
    const [filterAction, setFilterAction] = useState('')
    const [filterDateFrom, setFilterDateFrom] = useState('')
    const [filterDateTo, setFilterDateTo] = useState('')
    const [selectedLog, setSelectedLog] = useState<any>(null)
    const limit = 20

    const fetchLogs = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const params = new URLSearchParams()
        if (filterUser) params.append('user_id', filterUser)
        if (filterAction) params.append('action', filterAction)
        if (filterDateFrom) params.append('date_from', filterDateFrom)
        if (filterDateTo) params.append('date_to', filterDateTo)
        params.append('limit', String(limit))
        params.append('offset', String(page * limit))

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/audit-logs?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setLogs(data.data || [])
        setTotal(data.total || 0)
      } catch (err) {
        console.error('Gagal memuat audit logs:', err)
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => { fetchLogs() }, [page])
    useEffect(() => { setPage(0); fetchLogs() }, [filterUser, filterAction, filterDateFrom, filterDateTo])

    const actionLabel = (action: string) => {
      const map: Record<string, { label: string; color: string }> = {
        approve_application: { label: 'Setuju Aplikasi', color: 'bg-green-100 text-green-800' },
        reject_application: { label: 'Tolak Aplikasi', color: 'bg-red-100 text-red-800' },
        send_email: { label: 'Kirim Email', color: 'bg-blue-100 text-blue-800' },
        approve_claim: { label: 'Setuju Klaim', color: 'bg-green-100 text-green-800' },
        reject_claim: { label: 'Tolak Klaim', color: 'bg-red-100 text-red-800' },
        claim_status_change: { label: 'Ubah Status Klaim', color: 'bg-yellow-100 text-yellow-800' },
      }
      return map[action] || { label: action, color: 'bg-gray-100 text-gray-800' }
    }

    const totalPages = Math.ceil(total / limit)

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Audit Logs</h2>
          <p className="text-gray-600 mt-1">Lacak semua aktivitas admin & perubahan sistem</p>
        </div>

        <div className="bg-white rounded-lg border p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">User ID</label>
            <input type="text" placeholder="Filter user..." value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Aksi</label>
            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">Semua</option>
              <option value="approve_application">Setuju Aplikasi</option>
              <option value="reject_application">Tolak Aplikasi</option>
              <option value="send_email">Kirim Email</option>
              <option value="approve_claim">Setuju Klaim</option>
              <option value="reject_claim">Tolak Klaim</option>
              <option value="claim_status_change">Ubah Status Klaim</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Dari</label>
            <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sampai</label>
            <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => { setPage(0); fetchLogs() }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Terapkan</button>
          {(filterUser || filterAction || filterDateFrom || filterDateTo) && (
            <button onClick={() => { setFilterUser(''); setFilterAction(''); setFilterDateFrom(''); setFilterDateTo(''); setPage(0) }} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Reset</button>
          )}
        </div>

        <div className="bg-white rounded-lg border">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Memuat...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">Belum ada data audit log.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entitas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {logs.map((log: any) => {
                      const act = actionLabel(log.action)
                      return (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{log.user_name || log.user_email || log.user_id || '-'}</td>
                          <td className="px-4 py-3"><span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${act.color}`}>{act.label}</span></td>
                          <td className="px-4 py-3 text-sm text-gray-600"><span className="font-medium">{log.entity_type}</span><span className="text-gray-400 mx-1">/</span><span className="font-mono text-xs">{log.entity_id?.slice(0, 8)}...</span></td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-500">{log.ip_address || '-'}</td>
                          <td className="px-4 py-3"><button onClick={() => setSelectedLog(log)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">Lihat</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-3 border-t bg-gray-50 flex items-center justify-between text-sm text-gray-600">
                <span>Menampilkan {logs.length} dari {total} log{page > 0 && ` (Halaman ${page + 1}/${totalPages})`}</span>
                <div className="flex gap-2">
                  <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded-lg disabled:opacity-30 hover:bg-gray-100">← Sebelumnya</button>
                  <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded-lg disabled:opacity-30 hover:bg-gray-100">Berikutnya →</button>
                </div>
              </div>
            </>
          )}
        </div>

        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedLog(null)}>
            <div className="bg-white rounded-lg p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Detail Audit Log</h3>
                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">ID</span><span className="font-mono text-xs">{selectedLog.id}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Waktu</span><span>{new Date(selectedLog.created_at).toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">User</span><span>{selectedLog.user_name || selectedLog.user_email || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Aksi</span><span className={`px-2 py-0.5 text-xs rounded-full ${actionLabel(selectedLog.action).color}`}>{actionLabel(selectedLog.action).label}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Entitas</span><span>{selectedLog.entity_type} / {selectedLog.entity_id}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">IP</span><span className="font-mono">{selectedLog.ip_address || '-'}</span></div>
                {selectedLog.changes_json && (
                  <div><span className="text-gray-500 block mb-1">Perubahan</span><pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto font-mono">{JSON.stringify(selectedLog.changes_json, null, 2)}</pre></div>
                )}
              </div>
              <div className="mt-4 flex justify-end"><button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm">Tutup</button></div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            Insurance Admin
          </Link>
          <nav className="flex gap-6 items-center">
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/dashboard/reports" className="text-gray-700 hover:text-blue-600">
              Reports
            </Link>
            <Link href="/dashboard/analytics" className="text-gray-700 hover:text-blue-600">
              Analytics
            </Link>
            <Link href="/dashboard/settings" className="text-blue-600 font-medium">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600">Manage system configuration and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('organization')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'organization'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Organization
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'email'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Email Config
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Audit Logs
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'organization' && renderOrganizationTab()}
          {activeTab === 'email' && renderEmailTab()}
          {activeTab === 'audit' && renderAuditTab()}
        </div>
      </div>
    </div>
  )
}
