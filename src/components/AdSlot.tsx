import { useEffect } from 'react'

interface Props {
  slotId: string
  style?: React.CSSProperties
  className?: string
}

export const AdSlot = ({ slotId, style, className }: Props) => {
  useEffect(() => {
    ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
    ;(window as any).adsbygoogle.push({})
  }, [])

  return (
    <ins
      className={`adsbygoogle ${className ?? ''}`}
      style={{ display: 'block', ...style }}
      data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}

export default AdSlot
