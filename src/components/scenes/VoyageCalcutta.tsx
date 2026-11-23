import { Mark, MarkerText } from '@/components/kokonutui/marker-text';

/** The Calcutta postcard line with its pen marks; split out so the marker-text code loads after first paint. */
export default function VoyageCalcutta({ className, show }: { className: string; show: boolean }) {
  return (
    <MarkerText as="p" className={className} show={show}>
      They make a new home in Calcutta. In <Mark type="circle" className="px-1.5">Tangra</Mark>, its Chinatown, the wok meets Indian spice: Indo-Chinese food is born, <Mark type="underline">new, yet familiar</Mark>.
    </MarkerText>
  );
}
