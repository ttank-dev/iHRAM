'use client'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  const goToPage = (page: number) => {
    onPageChange(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="pg-wrap">
        <button
          className="pg-btn nav"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Prev
        </button>

        {getPageNumbers().map((page, i) =>
          page === '...' ? (
            <span key={`e-${i}`} className="pg-ellipsis">...</span>
          ) : (
            <button
              key={page}
              className={`pg-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => goToPage(page as number)}
            >
              {page}
            </button>
          )
        )}

        <button
          className="pg-btn nav"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>

      <style>{`
        .pg-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .pg-btn {
          padding: 8px 14px;
          border: 1px solid #E5E5E0;
          border-radius: 8px;
          background: white;
          font-size: 13px;
          font-weight: 600;
          color: #2C2C2C;
          cursor: pointer;
          min-width: 40px;
          transition: all 0.15s;
        }
        .pg-btn:hover:not(:disabled) { border-color: #B8936D; color: #B8936D; }
        .pg-btn.active { background: #B8936D; color: white; border-color: #B8936D; }
        .pg-btn.nav { background: #B8936D; color: white; border: none; min-width: auto; }
        .pg-btn.nav:disabled { background: #E5E5E0; color: #999; cursor: not-allowed; }
        .pg-ellipsis { padding: 0 6px; color: #999; font-size: 14px; }

        @media (max-width: 480px) {
          .pg-btn { padding: 8px 10px; font-size: 12px; min-width: 34px; }
        }
      `}</style>
    </>
  )
}