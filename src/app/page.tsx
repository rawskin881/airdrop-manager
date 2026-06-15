'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Hourglass,
  Rocket,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  CalendarDays,
  TrendingUp,
  Star,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface Airdrop {
  id: string
  name: string
  deadline: string
  status: string
  notes: string
  url: string
  createdAt: string
  updatedAt: string
}

type AirdropFormData = {
  name: string
  deadline: string
  status: string
  notes: string
  url: string
}

const emptyForm: AirdropFormData = {
  name: '',
  deadline: '',
  status: 'belum_klaim',
  notes: '',
  url: '',
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  belum_klaim: { label: 'Belum Klaim', icon: Clock, className: 'status-belum_klaim' },
  sudah_klaim: { label: 'Sudah Klaim', icon: CheckCircle2, className: 'status-sudah_klaim' },
  pending: { label: 'Pending', icon: Hourglass, className: 'status-pending' },
}

function getTimeRemaining(deadline: string): { days: number; hours: number; isUrgent: boolean; isExpired: boolean } {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  const hours = Math.ceil(diff / (1000 * 60 * 60))
  return {
    days,
    hours,
    isUrgent: days >= 0 && days <= 3,
    isExpired: diff < 0,
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function Home() {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingAirdrop, setEditingAirdrop] = useState<Airdrop | null>(null)
  const [deletingAirdrop, setDeletingAirdrop] = useState<Airdrop | null>(null)
  const [formData, setFormData] = useState<AirdropFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchAirdrops = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/airdrops')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setAirdrops(data)
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal memuat data airdrop',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const seedData = useCallback(async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      if (data.message?.includes('Skipping')) {
        toast({ title: 'Info', description: 'Data sudah ada di database' })
      } else {
        toast({ title: 'Sukses! ✨', description: `${data.message}` })
      }
      fetchAirdrops()
    } catch {
      toast({ title: 'Error', description: 'Gagal seeding data', variant: 'destructive' })
    }
  }, [toast, fetchAirdrops])

  useEffect(() => {
    fetchAirdrops()
  }, [fetchAirdrops])

  useEffect(() => {
    if (airdrops.length === 0 && !loading) {
      seedData()
    }
  }, [airdrops.length, loading, seedData])

  const urgentAirdrops = airdrops.filter((a) => {
    const { isUrgent, isExpired } = getTimeRemaining(a.deadline)
    return isUrgent && !isExpired && a.status !== 'sudah_klaim'
  })

  const filteredAirdrops = airdrops.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.notes.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || a.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: airdrops.length,
    belumKlaim: airdrops.filter((a) => a.status === 'belum_klaim').length,
    sudahKlaim: airdrops.filter((a) => a.status === 'sudah_klaim').length,
    pending: airdrops.filter((a) => a.status === 'pending').length,
  }

  const handleOpenAdd = () => {
    setEditingAirdrop(null)
    setFormData(emptyForm)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (airdrop: Airdrop) => {
    setEditingAirdrop(airdrop)
    setFormData({
      name: airdrop.name,
      deadline: new Date(airdrop.deadline).toISOString().split('T')[0],
      status: airdrop.status,
      notes: airdrop.notes,
      url: airdrop.url,
    })
    setIsFormOpen(true)
  }

  const handleOpenDelete = (airdrop: Airdrop) => {
    setDeletingAirdrop(airdrop)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.deadline) {
      toast({ title: 'Error', description: 'Nama dan deadline wajib diisi!', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const url = editingAirdrop ? `/api/airdrops/${editingAirdrop.id}` : '/api/airdrops'
      const method = editingAirdrop ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to save')

      toast({
        title: editingAirdrop ? 'Diperbarui! ✨' : 'Ditambahkan! 🎉',
        description: `Airdrop "${formData.name}" berhasil ${editingAirdrop ? 'diperbarui' : 'ditambahkan'}`,
      })

      setIsFormOpen(false)
      setFormData(emptyForm)
      setEditingAirdrop(null)
      fetchAirdrops()
    } catch {
      toast({ title: 'Error', description: 'Gagal menyimpan airdrop', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownload = async () => {
    try {
      toast({ title: 'Memproses...', description: 'Menyiapkan file download' })
      const res = await fetch('/api/download')
      if (!res.ok) throw new Error('Failed to download')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'airdrop-tracker-project.zip'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Download Dimulai! 📦',
        description: 'File zip sedang diunduh',
      })
    } catch {
      toast({ title: 'Error', description: 'Gagal mendownload file', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deletingAirdrop) return

    try {
      const res = await fetch(`/api/airdrops/${deletingAirdrop.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')

      toast({
        title: 'Dihapus! 🗑️',
        description: `Airdrop "${deletingAirdrop.name}" berhasil dihapus`,
      })

      setIsDeleteOpen(false)
      setDeletingAirdrop(null)
      fetchAirdrops()
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus airdrop', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #FFE4E9 0%, #F5F0FF 30%, #F0F4FF 60%, #E8F5E9 100%)' }}>
      {/* Header */}
      <header className="relative overflow-hidden border-b border-pink-100" style={{ background: 'linear-gradient(135deg, #FFE4E9 0%, #E6E6FA 40%, #D1C4E9 70%, #B3E5FC 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-2 left-[10%] text-pink-300 animate-sparkle">✦</div>
          <div className="absolute top-6 left-[30%] text-purple-300 animate-sparkle" style={{ animationDelay: '0.5s' }}>✧</div>
          <div className="absolute top-3 right-[20%] text-blue-300 animate-sparkle" style={{ animationDelay: '1s' }}>✦</div>
          <div className="absolute top-8 right-[40%] text-pink-200 animate-sparkle" style={{ animationDelay: '1.5s' }}>✧</div>
          <div className="absolute bottom-2 left-[50%] text-purple-200 animate-sparkle" style={{ animationDelay: '0.8s' }}>✦</div>
          <div className="absolute bottom-4 left-[70%] text-blue-200 animate-sparkle" style={{ animationDelay: '1.2s' }}>⋆</div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white/50 shadow-lg animate-float">
                <img
                  src="/anime-mascot.png"
                  alt="Airdrop-chan"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Airdrop Tracker
                </h1>
                <p className="text-xs sm:text-sm text-purple-600/70 font-medium">
                  Kelola airdrop crypto kamu! ✨
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={fetchAirdrops}
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/40 text-purple-600"
                title="Refresh data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleDownload}
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/40 text-purple-600"
                title="Download project files"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleOpenAdd}
                className="rounded-full shadow-lg hover:shadow-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #FFB6C1, #D1C4E9)' }}
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Tambah Airdrop</span>
                <span className="sm:hidden">Tambah</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-pink-100 shadow-sm hover:shadow-md transition-shadow" style={{ background: 'linear-gradient(145deg, rgba(255,182,193,0.15), rgba(255,255,255,0.9))' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-pink-100">
                  <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-pink-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-pink-700">{stats.total}</p>
                  <p className="text-[10px] sm:text-xs text-pink-500">Total Airdrop</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose-100 shadow-sm hover:shadow-md transition-shadow" style={{ background: 'linear-gradient(145deg, rgba(255,105,180,0.1), rgba(255,255,255,0.9))' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-rose-100">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-rose-700">{stats.belumKlaim}</p>
                  <p className="text-[10px] sm:text-xs text-rose-500">Belum Klaim</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100 shadow-sm hover:shadow-md transition-shadow" style={{ background: 'linear-gradient(145deg, rgba(255,218,185,0.2), rgba(255,255,255,0.9))' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100">
                  <Hourglass className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-amber-700">{stats.pending}</p>
                  <p className="text-[10px] sm:text-xs text-amber-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow" style={{ background: 'linear-gradient(145deg, rgba(178,223,219,0.2), rgba(255,255,255,0.9))' }}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-emerald-700">{stats.sudahKlaim}</p>
                  <p className="text-[10px] sm:text-xs text-emerald-500">Sudah Klaim</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Reminder Section */}
        {urgentAirdrops.length > 0 && (
          <Card className="border-red-200 shadow-md overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,182,193,0.2), rgba(255,255,255,0.95))' }}>
            <CardHeader className="pb-2 sm:pb-3" style={{ background: 'linear-gradient(135deg, rgba(255,105,180,0.15), rgba(209,196,233,0.15))' }}>
              <CardTitle className="flex items-center gap-2 text-red-600 text-sm sm:text-base">
                <div className="relative">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse-soft" />
                </div>
                <span>Deadline Mendesak!</span>
                <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] sm:text-xs">
                  {urgentAirdrops.length} airdrop
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <div className="hidden sm:block w-20 h-20 flex-shrink-0 animate-float">
                  <img
                    src="/anime-reminder.png"
                    alt="Reminder-chan"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 space-y-2 max-h-48 overflow-y-auto">
                  {urgentAirdrops.map((airdrop) => {
                    const { days, hours } = getTimeRemaining(airdrop.deadline)
                    const statusCfg = STATUS_CONFIG[airdrop.status]
                    return (
                      <div
                        key={airdrop.id}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-red-100 hover:border-red-200 transition-colors"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,230,233,0.5))' }}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="p-1.5 rounded-lg bg-red-100 flex-shrink-0">
                            <CalendarDays className="h-3.5 w-3.5 text-red-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-800 truncate">{airdrop.name}</p>
                            <p className="text-[10px] sm:text-xs text-red-500 font-medium">
                              {days <= 0 ? `${Math.abs(hours)} jam lagi` : `${days} hari lagi`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${statusCfg.className}`}>
                            <statusCfg.icon className="h-3 w-3" />
                            {statusCfg.label}
                          </span>
                          {airdrop.url && (
                            <a
                              href={airdrop.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
            <Input
              placeholder="Cari airdrop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200 bg-white/80"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-purple-400 sm:hidden" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-purple-100 bg-white/80">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="belum_klaim">Belum Klaim</SelectItem>
                <SelectItem value="sudah_klaim">Sudah Klaim</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Airdrop List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse border-purple-50">
                <CardContent className="p-4 space-y-3">
                  <div className="h-5 bg-purple-100 rounded w-3/4" />
                  <div className="h-4 bg-pink-100 rounded w-1/2" />
                  <div className="h-3 bg-purple-50 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAirdrops.length === 0 ? (
          <Card className="border-purple-50" style={{ background: 'linear-gradient(145deg, rgba(255,230,233,0.3), rgba(255,255,255,0.9))' }}>
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 animate-float">
                <img
                  src="/anime-hero.png"
                  alt="No airdrops"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-purple-700 mb-1">
                Belum ada airdrop! 🌸
              </h3>
              <p className="text-sm text-purple-500 mb-4">
                {searchQuery || filterStatus !== 'all'
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Tambahkan airdrop pertama kamu sekarang'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Button
                  onClick={handleOpenAdd}
                  className="rounded-full"
                  style={{ background: 'linear-gradient(135deg, #FFB6C1, #D1C4E9)' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Airdrop Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAirdrops.map((airdrop) => {
              const { days, isUrgent, isExpired } = getTimeRemaining(airdrop.deadline)
              const statusCfg = STATUS_CONFIG[airdrop.status]
              return (
                <Card
                  key={airdrop.id}
                  className={`group border shadow-sm hover:shadow-lg transition-all duration-300 ${
                    isUrgent && !isExpired && airdrop.status !== 'sudah_klaim'
                      ? 'border-red-200'
                      : isExpired
                      ? 'border-gray-200 opacity-75'
                      : 'border-purple-50'
                  }`}
                  style={{
                    background: isExpired
                      ? 'linear-gradient(145deg, rgba(200,200,200,0.1), rgba(255,255,255,0.9))'
                      : isUrgent && airdrop.status !== 'sudah_klaim'
                      ? 'linear-gradient(145deg, rgba(255,182,193,0.2), rgba(255,255,255,0.95))'
                      : 'linear-gradient(145deg, rgba(230,230,250,0.2), rgba(255,255,255,0.95))',
                  }}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                          {airdrop.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <CalendarDays className="h-3 w-3 text-purple-400 flex-shrink-0" />
                          <span className={`text-xs font-medium ${
                            isExpired ? 'text-gray-400 line-through' :
                            isUrgent ? 'text-red-500' : 'text-purple-500'
                          }`}>
                            {formatDate(airdrop.deadline)}
                          </span>
                          {!isExpired && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              isUrgent ? 'bg-red-100 text-red-600' : 'bg-purple-50 text-purple-500'
                            }`}>
                              {days}h lagi
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                              Expired
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${statusCfg.className}`}>
                        <statusCfg.icon className="h-3 w-3" />
                        {statusCfg.label}
                      </span>
                    </div>

                    {airdrop.notes && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                        {airdrop.notes}
                      </p>
                    )}

                    <Separator className="my-3 bg-purple-50" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {airdrop.url ? (
                          <a
                            href={airdrop.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 transition-colors font-medium"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="hidden sm:inline">Buka Link</span>
                            <span className="sm:hidden">Link</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">No link</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-purple-50 text-purple-400 hover:text-purple-600"
                          onClick={() => handleOpenEdit(airdrop)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-red-50 text-red-300 hover:text-red-500"
                          onClick={() => handleOpenDelete(airdrop)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-pink-100 mt-auto" style={{ background: 'linear-gradient(135deg, #FFE4E9, #E6E6FA, #B3E5FC)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-xs sm:text-sm text-purple-600/70 font-medium">
                Airdrop Tracker — Jangan sampai kelewat! 🚀
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-purple-400">
                <Star className="h-3 w-3" />
                <span>Made with ✨ anime vibes</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-400">
                <TrendingUp className="h-3 w-3" />
                <span>{stats.total} airdrops tracked</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-purple-100" style={{ background: 'linear-gradient(145deg, rgba(255,230,233,0.2), rgba(255,255,255,0.98))' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-700">
              {editingAirdrop ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Edit Airdrop
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Tambah Airdrop Baru
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-purple-500/70">
              {editingAirdrop ? 'Perbarui informasi airdrop' : 'Isi detail airdrop crypto kamu'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-purple-700 text-sm font-medium">
                Nama Airdrop <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                placeholder="contoh: LayerZero ZRO Airdrop"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-purple-700 text-sm font-medium">
                Deadline <span className="text-red-400">*</span>
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-purple-700 text-sm font-medium">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="rounded-xl border-purple-100 focus:border-purple-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="belum_klaim">
                    <span className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-pink-500" />
                      Belum Klaim
                    </span>
                  </SelectItem>
                  <SelectItem value="sudah_klaim">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      Sudah Klaim
                    </span>
                  </SelectItem>
                  <SelectItem value="pending">
                    <span className="flex items-center gap-2">
                      <Hourglass className="h-3 w-3 text-amber-500" />
                      Pending
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-purple-700 text-sm font-medium">
                URL Link
              </Label>
              <Input
                id="url"
                placeholder="https://example.com/claim"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-purple-700 text-sm font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Catatan tambahan..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="rounded-xl border-purple-100 focus:border-purple-300 focus:ring-purple-200 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsFormOpen(false)}
              className="rounded-full text-purple-500 hover:bg-purple-50"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-full shadow-md"
              style={{ background: 'linear-gradient(135deg, #FFB6C1, #D1C4E9)' }}
            >
              {submitting ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editingAirdrop ? 'Simpan Perubahan' : 'Tambah Airdrop'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl border-red-100" style={{ background: 'linear-gradient(145deg, rgba(255,230,233,0.2), rgba(255,255,255,0.98))' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Hapus Airdrop?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Apakah kamu yakin ingin menghapus <strong className="text-gray-700">&quot;{deletingAirdrop?.name}&quot;</strong>?
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
