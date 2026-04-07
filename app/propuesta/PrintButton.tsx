'use client'

export function PrintButton({ businessName }: { businessName: string }) {
  const handlePrint = () => {
    const prevTitle = document.title
    document.title = `Propuesta devmark - ${businessName}`
    window.print()
    document.title = prevTitle
  }

  return (
    <button
      onClick={handlePrint}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: '#0C2D4E',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '10px 18px',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      🖨 Imprimir / PDF
    </button>
  )
}
