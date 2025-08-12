import { useEffect, useRef } from 'react'

export default function AdSenseBlock() {
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
      data-ad-slot="1234567890"
      data-ad-format="auto"
      data-full-width-responsive="true"
      ref={ref as any}
    />
  )
}
