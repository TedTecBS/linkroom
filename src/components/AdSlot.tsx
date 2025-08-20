import { useEffect, useRef } from 'react'

interface AdSlotProps {
  slot: string
  format?: string
  layout?: string
}

export default function AdSlot({ slot, format = 'auto', layout }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window || !(window as any).adsbygoogle) return
    try {
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch {}
  }, [])

  return (
    <ins
      className="adsbygoogle block my-4"
      style={{ display: 'block' }}
      data-ad-client={import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout}
      data-full-width-responsive="true"
      ref={ref as any}
    />
  )
}
