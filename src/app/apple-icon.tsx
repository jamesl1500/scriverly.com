import { ImageResponse } from 'next/og';
import { SITE_ACCENT_COLOR } from '@/config/site';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: SITE_ACCENT_COLOR,
        }}
      >
        <svg width={120} height={120} viewBox="0 0 20 20" fill="none">
          <path
            d="M15.5 2C13 2 9.5 5 8 8L4.5 15.5L6 17L13.5 13C16.5 11.5 19 8 19 5.5C19 3.5 17.5 2 15.5 2Z"
            fill="#FFFFFF"
          />
          <path d="M4.5 15.5L3 18L5.5 16.5L4.5 15.5Z" fill="#FFFFFF" fillOpacity={0.7} />
        </svg>
      </div>
    ),
    { ...size }
  );
}
