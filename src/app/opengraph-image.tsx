import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TITLE } from '@/config/site';

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F9F7F4',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <svg width={72} height={72} viewBox="0 0 20 20" fill="none">
            <path
              d="M15.5 2C13 2 9.5 5 8 8L4.5 15.5L6 17L13.5 13C16.5 11.5 19 8 19 5.5C19 3.5 17.5 2 15.5 2Z"
              fill="#C8854A"
            />
            <path d="M4.5 15.5L3 18L5.5 16.5L4.5 15.5Z" fill="#C8854A" fillOpacity={0.6} />
          </svg>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, color: '#1C1917' }}>
            {SITE_NAME}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 32,
            color: '#6B5F55',
            maxWidth: 860,
            textAlign: 'center',
          }}
        >
          AI-powered academic writing assistant
        </div>
      </div>
    ),
    { ...size }
  );
}
