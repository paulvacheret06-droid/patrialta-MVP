import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#92400e',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fef3c7',
          fontSize: 18,
          fontWeight: 700,
          fontFamily: 'serif',
        }}
      >
        P
      </div>
    ),
    { ...size }
  )
}
