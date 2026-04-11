import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 50%, #4338ca 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow blobs */}
        <div style={{
          position: 'absolute', top: -80, left: -80,
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'rgba(167,139,250,0.25)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.25)',
          filter: 'blur(80px)',
        }} />

        {/* Logo */}
        <div style={{
          fontSize: 64,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-2.5px',
          marginBottom: 18,
          display: 'flex',
        }}>
          CoverDraft
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 30,
          color: 'rgba(196,181,253,1)',
          fontWeight: 500,
          marginBottom: 52,
          letterSpacing: '-0.5px',
          display: 'flex',
        }}>
          From job post to interview-ready in minutes
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 14 }}>
          {['AI Cover Letter', 'Job Fit Score', 'Interview Prep', 'Follow-up Email'].map((f) => (
            <div
              key={f}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 100,
                padding: '10px 22px',
                fontSize: 19,
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 500,
                display: 'flex',
              }}
            >
              {f}
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div style={{
          position: 'absolute',
          bottom: 36,
          fontSize: 16,
          color: 'rgba(196,181,253,0.7)',
          letterSpacing: '0.05em',
          display: 'flex',
        }}>
          coverdraft.app · Free to start
        </div>
      </div>
    ),
    { ...size }
  );
}
