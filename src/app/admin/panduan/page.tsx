'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Guide {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  category: string | null
  is_published: boolean
  created_at: string
}

export default function AdminPanduanPage() {
  const supabase = createClient()
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 })

  useEffect(() => { fetchGuides() }, [filter])

  const fetchGuides = async () => {
    setLoading(true)
    try {
      let query = supabase.from('guides').select('*').order('created_at', { ascending: false })
      if (filter === 'published') query = query.eq('is_published', true)
      else if (filter === 'draft') query = query.eq('is_published', false)

      const { data, error } = await query
      if (error) throw error
      setGuides(data || [])

      const { data: all } = await supabase.from('guides').select('id, is_published')
      if (all) {
        setStats({
          total: all.length,
          published: all.filter(g => g.is_published).length,
          draft: all.filter(g => !g.is_published).length
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublish = async (id: string, current: boolean) => {
    if (!confirm(current ? 'Nyahterbit panduan ini?' : 'Terbitkan panduan ini?')) return
    try {
      const { error } = await supabase.from('guides').update({ is_published: !current }).eq('id', id)
      if (error) throw error
      alert(current ? '📝 Panduan dinyahterbit!' : '✅ Panduan diterbitkan!')
      fetchGuides()
    } catch { alert('❌ Ralat kemaskini') }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`⚠️ PADAM: ${title}\n\nTindakan ini TIDAK boleh dibatalkan!`)) return
    const input = prompt(`Taip "${title}" untuk sahkan:`)
    if (input !== title) { alert('❌ Nama tidak sepadan. Pembatalan dibatalkan.'); return }
    try {
      const { error } = await supabase.from('guides').delete().eq('id', id)
      if (error) throw error
      alert('🗑️ Panduan berjaya dipadam!')
      fetchGuides()
    } catch (e: any) { alert(`❌ Ralat: ${e.message}`) }
  }

  const filtered = guides.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ActionBtns = ({ g }: { g: Guide }) => (
    <div className="gp-acts">
      <Link href={`/panduan/${g.slug}`} target="_blank" className="gp-ab gp-ab-view" title="Lihat">👁️</Link>
      <Link href={`/admin/panduan/edit/${g.id}`} className="gp-ab gp-ab-edit" title="Edit">✏️</Link>
      <button className={`gp-ab ${g.is_published ? 'gp-ab-unpub' : 'gp-ab-pub'}`}
        onClick={() => handleTogglePublish(g.id, g.is_published)} title={g.is_published ? 'Nyahterbit' : 'Terbit'}>
        {g.is_published ? '📝' : '✓'}
      </button>
      <button className="gp-ab gp-ab-del" onClick={() => handleDelete(g.id, g.title)} title="Padam">🗑️</button>
    </div>
  )

  if (loading) return (
    <>
      <div className="gp-load"><div className="gp-spin" /><p>Memuatkan panduan...</p></div>
      <style dangerouslySetInnerHTML={{ __html: `
        .gp-load{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;color:#999}
        .gp-spin{width:36px;height:36px;border:3px solid #e5e5e5;border-top-color:#B8936D;border-radius:50%;animation:gps .7s linear infinite}
        @keyframes gps{to{transform:rotate(360deg)}}
      `}} />
    </>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* ═══ RESET ═══ */
        .gp,.gp *,.gp *::before,.gp *::after{box-sizing:border-box}

        .gp{width:100%;max-width:1100px}

        /* ═══ HEADER ═══ */
        .gp-hd{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
        .gp h1{font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .gp-sub{font-size:14px;color:#888;margin:0}
        .gp-add{
          padding:10px 20px;background:#B8936D;color:#fff;border:none;border-radius:8px;
          font-size:14px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:6px;
          white-space:nowrap;transition:background .15s;
        }
        .gp-add:hover{background:#a07d5a}

        /* ═══ STATS ═══ */
        .gp-stats{display:flex;gap:8px;margin-bottom:16px}
        .gp-st{
          flex:1 1 0%;min-width:0;background:#fff;border-radius:10px;padding:14px 8px;
          border:2px solid #E5E5E0;cursor:pointer;text-align:center;transition:border-color .15s;
        }
        .gp-st:hover{border-color:#ccc}
        .gp-st.on{border-color:#B8936D}
        .gp-st-i{font-size:16px;line-height:1}
        .gp-st-l{font-size:11px;color:#888;font-weight:500;margin:2px 0}
        .gp-st-v{font-size:22px;font-weight:700;color:#2C2C2C}

        /* ═══ SEARCH ═══ */
        .gp-search{
          display:flex;align-items:center;gap:8px;
          background:#fff;border-radius:10px;padding:10px 14px;
          border:1px solid #E5E5E0;margin-bottom:14px;
        }
        .gp-search input{flex:1;border:none;outline:none;font-size:14px;background:transparent;color:#2C2C2C;min-width:0}
        .gp-search input::placeholder{color:#bbb}
        .gp-cnt{font-size:12px;color:#888;font-weight:600;white-space:nowrap}

        /* ═══ TABLE (desktop) ═══ */
        .gp-table{background:#fff;border-radius:10px;border:1px solid #E5E5E0;overflow:hidden}
        .gp-thead{
          display:grid;grid-template-columns:2fr 1fr 1fr 1fr 160px;
          padding:12px 18px;background:#F5F5F0;border-bottom:1px solid #E5E5E0;
          font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.5px;
        }
        .gp-trow{
          display:grid;grid-template-columns:2fr 1fr 1fr 1fr 160px;
          padding:14px 18px;border-bottom:1px solid #f0f0ec;align-items:center;
          transition:background .1s;
        }
        .gp-trow:hover{background:#FAFAF8}
        .gp-trow:last-child{border-bottom:none}

        /* Guide info cell */
        .gp-info{display:flex;align-items:center;gap:10px;min-width:0}
        .gp-thumb{
          width:48px;height:48px;border-radius:6px;background:#F5F5F0;flex-shrink:0;
          background-size:cover;background-position:center;
          display:flex;align-items:center;justify-content:center;font-size:20px;
        }
        .gp-ttl{font-size:14px;font-weight:600;color:#2C2C2C;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .gp-exc{font-size:12px;color:#999;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:250px}

        /* Category badge */
        .gp-cat{padding:4px 10px;background:rgba(184,147,109,.1);color:#B8936D;border-radius:5px;font-size:11px;font-weight:700;text-transform:capitalize;display:inline-block}
        .gp-nocat{font-size:13px;color:#ccc}

        /* Date */
        .gp-date{font-size:13px;color:#666}

        /* Status badge */
        .gp-badge{padding:3px 10px;border-radius:5px;font-size:10px;font-weight:700;display:inline-block}
        .gp-badge.pub{background:rgba(16,185,129,.1);color:#10B981}
        .gp-badge.draft{background:rgba(245,158,11,.1);color:#F59E0B}

        /* Action buttons */
        .gp-acts{display:flex;gap:4px}
        .gp-ab{
          width:32px;height:32px;border:none;border-radius:6px;font-size:13px;
          cursor:pointer;display:flex;align-items:center;justify-content:center;
          text-decoration:none;transition:opacity .15s;
        }
        .gp-ab:hover{opacity:.8}
        .gp-ab-view{background:#F5F5F0;color:#2C2C2C}
        .gp-ab-edit{background:#3B82F6;color:#fff}
        .gp-ab-pub{background:#10B981;color:#fff}
        .gp-ab-unpub{background:#F59E0B;color:#fff}
        .gp-ab-del{background:#EF4444;color:#fff}

        /* ═══ CARDS (mobile) ═══ */
        .gp-cards{display:none}
        .gp-card{
          background:#fff;border-radius:10px;padding:14px;border:1px solid #E5E5E0;margin-bottom:8px;
        }
        .gp-card-top{display:flex;gap:10px;margin-bottom:10px}
        .gp-card-body{flex:1;min-width:0}
        .gp-card-ttl{font-size:14px;font-weight:600;color:#2C2C2C;margin-bottom:4px}
        .gp-card-exc{font-size:12px;color:#999;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .gp-card-meta{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:11px;color:#888}
        .gp-card-acts{display:flex;gap:6px;padding-top:10px;border-top:1px solid #f0f0ec}
        .gp-card-acts .gp-ab{flex:1;height:36px;border-radius:8px;font-size:14px}

        /* Empty */
        .gp-empty{background:#fff;border-radius:10px;padding:40px 16px;text-align:center;border:1px solid #E5E5E0}
        .gp-empty p{font-size:14px;color:#888;margin:8px 0 0}

        /* ═══ DESKTOP ≥1024px ═══ */
        @media(min-width:1024px){
          .gp h1{font-size:28px}
          .gp-sub{font-size:15px}
          .gp-stats{gap:12px;margin-bottom:20px}
          .gp-st{padding:20px 16px;border-radius:12px}
          .gp-st-i{font-size:20px}
          .gp-st-l{font-size:13px}
          .gp-st-v{font-size:28px}
          .gp-search{padding:14px 20px;border-radius:12px;margin-bottom:20px}
          .gp-search input{font-size:15px}
          .gp-table{border-radius:12px}
          .gp-trow{padding:16px 20px}
          .gp-thumb{width:56px;height:56px}
        }

        /* ═══ TABLET 640–1023px ═══ */
        @media(min-width:640px) and (max-width:1023px){
          .gp-thead{grid-template-columns:2fr 1fr 1fr 140px}
          .gp-trow{grid-template-columns:2fr 1fr 1fr 140px}
          .gp-thead>div:nth-child(2),.gp-trow>div:nth-child(2){display:none}
          .gp-st{padding:16px 12px}
          .gp-st-v{font-size:24px}
        }

        /* ═══ MOBILE <640px ═══ */
        @media(max-width:639px){
          .gp-table{display:none}
          .gp-cards{display:block}
          .gp-stats{gap:6px}
          .gp-st{padding:10px 4px;border-radius:8px}
          .gp-st-v{font-size:18px}
          .gp-st-l{font-size:9px}
          .gp-st-i{font-size:13px}
          .gp-hd{flex-direction:column;align-items:flex-start;gap:8px}
          .gp-add{width:100%;justify-content:center;padding:12px}
          .gp h1{font-size:20px}
          .gp-sub{font-size:12px;margin-bottom:4px}
          .gp-search{padding:8px 10px;border-radius:8px}
          .gp-search input{font-size:13px}
        }
      `}} />

      <div className="gp">
        {/* Header */}
        <div className="gp-hd">
          <div>
            <h1>Urus Panduan</h1>
            <p className="gp-sub">Cipta & urus panduan umrah untuk jemaah</p>
          </div>
          <Link href="/admin/panduan/new" className="gp-add">➕ Tambah Panduan</Link>
        </div>

        {/* Stats */}
        <div className="gp-stats">
          {([
            { key: 'all' as const, i: '📚', l: 'Semua', v: stats.total },
            { key: 'published' as const, i: '✅', l: 'Terbit', v: stats.published },
            { key: 'draft' as const, i: '📝', l: 'Draf', v: stats.draft },
          ]).map(s => (
            <div key={s.key} className={`gp-st ${filter === s.key ? 'on' : ''}`} onClick={() => setFilter(s.key)}>
              <div className="gp-st-i">{s.i}</div>
              <div className="gp-st-l">{s.l}</div>
              <div className="gp-st-v">{s.v}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="gp-search">
          🔍
          <input placeholder="Cari panduan..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <span className="gp-cnt">{filtered.length} panduan</span>
        </div>

        {/* ═══ TABLE (desktop/tablet) ═══ */}
        <div className="gp-table">
          <div className="gp-thead">
            <div>Panduan</div>
            <div>Kategori</div>
            <div>Tarikh</div>
            <div>Status</div>
            <div>Tindakan</div>
          </div>
          {filtered.map(g => (
            <div key={g.id} className="gp-trow">
              <div className="gp-info">
                <div className="gp-thumb" style={g.cover_image ? {backgroundImage:`url(${g.cover_image})`} : {}}>
                  {!g.cover_image && '📖'}
                </div>
                <div style={{minWidth:0}}>
                  <div className="gp-ttl">{g.title}</div>
                  <div className="gp-exc">{g.excerpt || 'Tiada penerangan'}</div>
                </div>
              </div>
              <div>{g.category ? <span className="gp-cat">{g.category}</span> : <span className="gp-nocat">—</span>}</div>
              <div className="gp-date">{new Date(g.created_at).toLocaleDateString('ms-MY',{year:'numeric',month:'short',day:'numeric'})}</div>
              <div><span className={`gp-badge ${g.is_published ? 'pub' : 'draft'}`}>{g.is_published ? 'TERBIT' : 'DRAF'}</span></div>
              <ActionBtns g={g} />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="gp-empty">
              <div style={{fontSize:36}}>🔍</div>
              <p><b>Tiada panduan ditemui</b></p>
              <p>{searchQuery ? 'Cuba ubah carian' : 'Belum ada panduan'}</p>
              {!searchQuery && <Link href="/admin/panduan/new" className="gp-add" style={{marginTop:16,display:'inline-flex'}}>➕ Cipta Panduan Pertama</Link>}
            </div>
          )}
        </div>

        {/* ═══ CARDS (mobile) ═══ */}
        <div className="gp-cards">
          {filtered.map(g => (
            <div key={g.id} className="gp-card">
              <div className="gp-card-top">
                <div className="gp-thumb" style={g.cover_image ? {backgroundImage:`url(${g.cover_image})`,width:48,height:48} : {width:48,height:48}}>
                  {!g.cover_image && '📖'}
                </div>
                <div className="gp-card-body">
                  <div className="gp-card-ttl">{g.title}</div>
                  <div className="gp-card-exc">{g.excerpt || 'Tiada penerangan'}</div>
                  <div className="gp-card-meta">
                    <span className={`gp-badge ${g.is_published ? 'pub' : 'draft'}`}>{g.is_published ? 'TERBIT' : 'DRAF'}</span>
                    {g.category && <span className="gp-cat">{g.category}</span>}
                    <span>{new Date(g.created_at).toLocaleDateString('ms-MY',{month:'short',day:'numeric'})}</span>
                  </div>
                </div>
              </div>
              <div className="gp-card-acts">
                <Link href={`/panduan/${g.slug}`} target="_blank" className="gp-ab gp-ab-view" title="Lihat">👁️</Link>
                <Link href={`/admin/panduan/edit/${g.id}`} className="gp-ab gp-ab-edit" title="Edit">✏️</Link>
                <button className={`gp-ab ${g.is_published ? 'gp-ab-unpub' : 'gp-ab-pub'}`}
                  onClick={() => handleTogglePublish(g.id, g.is_published)}>
                  {g.is_published ? '📝' : '✓'}
                </button>
                <button className="gp-ab gp-ab-del" onClick={() => handleDelete(g.id, g.title)}>🗑️</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="gp-empty">
              <div style={{fontSize:36}}>🔍</div>
              <p><b>Tiada panduan ditemui</b></p>
              {!searchQuery && <Link href="/admin/panduan/new" className="gp-add" style={{marginTop:12,display:'inline-flex'}}>➕ Cipta Panduan</Link>}
            </div>
          )}
        </div>
      </div>
    </>
  )
}