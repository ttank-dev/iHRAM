'use client'

export default function ReviewImage({ 
  src, 
  alt 
}: { 
  src: string
  alt: string 
}) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '6px',
        border: '1px solid #2A2A2A',
        cursor: 'pointer'
      }}
      onClick={() => window.open(src, '_blank')}
    />
  )
}