import type { SVGProps } from 'react';
import type { ChannelKind } from '../data/projects';

type P = SVGProps<SVGSVGElement> & { size?: number };

const icon = (path: React.ReactNode) =>
  function Icon({ size = 18, ...props }: P) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        {path}
      </svg>
    );
  };

export const ArrowRight = icon(<path d="M5 12h14M13 6l6 6-6 6" />);
export const ArrowLeft = icon(<path d="M19 12H5M11 6l-6 6 6 6" />);
export const ArrowUpRight = icon(<path d="M7 17 17 7M8 7h9v9" />);
export const ArrowDown = icon(<path d="M12 5v14M6 13l6 6 6-6" />);
export const Globe = icon(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>);
export const Play = icon(<><rect x="3" y="4" width="18" height="14" rx="2" /><path d="m10 8.5 5 2.5-5 2.5z" /><path d="M8 21h8" /></>);
export const Phone = icon(<><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></>);
export const Code = icon(<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />);
export const Api = icon(<><path d="M5 7h14M5 12h14M5 17h9" /><circle cx="18" cy="17" r="2" /></>);
export const Instagram = icon(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>);
export const TikTok = icon(<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.4 4.3 5 4.5" />);
export const YouTube = icon(<><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9.5 4.5 2.5-4.5 2.5z" /></>);
export const Film = icon(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></>);
export const Doc = icon(<><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></>);
export const Lock = icon(<><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>);
export const Clock = icon(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
export const GitHub = icon(<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />);
export const LinkedIn = icon(<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></>);
export const Mail = icon(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>);

export const CHANNEL_ICON: Record<ChannelKind, ReturnType<typeof icon>> = {
  web: Globe,
  demo: Play,
  app: Phone,
  code: Code,
  api: Api,
  instagram: Instagram,
  tiktok: TikTok,
  youtube: YouTube,
  video: Film,
  document: Doc,
};
