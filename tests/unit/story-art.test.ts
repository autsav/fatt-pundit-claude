import { describe, it, expect } from 'vitest';
import { allPanels } from '../../src/data/story';
import { ART_SLOTS } from '../../src/data/story-art-slots';
import { STORY_ART, storyArt } from '../../src/data/story-art';

// AUDIT B-08: every story picture is a slot in one manifest; the tiger panels stay as placeholders.
describe('story-art manifest', () => {
  it('has one slot per id', () => {
    expect(new Set(ART_SLOTS.map((s) => s.id)).size).toBe(ART_SLOTS.length);
  });
  it('covers every comic panel, each with its placeholder art, alt and size', () => {
    for (const p of allPanels) {
      const a = storyArt(p.id);
      expect(a.kind).toBe('panel');
      expect(a.placeholder).toBe(true);
      expect(a.image, p.id).toBeDefined();
      expect(a.alt.length).toBeGreaterThan(20);
      expect(a.width).toBeGreaterThan(0);
      expect(a.height).toBeGreaterThan(0);
    }
  });
  it('marks every character layer as a placeholder for the illustrator', () => {
    for (const a of Object.values(STORY_ART).filter((s) => s.kind === 'character')) expect(a.placeholder, a.id).toBe(true);
  });
  it('fails loudly for an unknown slot', () => {
    expect(() => storyArt('not-a-slot')).toThrow(/not a slot/);
  });
});
