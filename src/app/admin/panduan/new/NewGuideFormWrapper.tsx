'use client'

import dynamic from 'next/dynamic'

const NewGuideForm = dynamic(() => import('./NewGuideForm'), { ssr: false })

export default function NewGuideFormWrapper({ categories }: { categories?: any[] }) {
  return <NewGuideForm categories={categories} />
}