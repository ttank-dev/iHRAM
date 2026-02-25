'use client'

import dynamic from 'next/dynamic'

const EditGuideForm = dynamic(() => import('./EditGuideForm'), { ssr: false })

export default function EditGuideFormWrapper({ guide, categories }: { guide: any, categories?: any[] }) {
  return <EditGuideForm guide={guide} categories={categories} />
}