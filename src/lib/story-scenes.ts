// Helpers for the story's scroll scenes (src/components/story/scenes/). The words come from
// src/data/story.ts by panel id; nothing is retyped in a scene.
import { chapters, type Chapter, type Panel } from '../data/story';

export const NUMBER_WORDS = ['one', 'two', 'three', 'four', 'five', 'six'];

export function chapterOf(id: string): { chapter: Chapter; index: number } {
  const index = chapters.findIndex((c) => c.id === id);
  if (index < 0) throw new Error(`story-scenes: chapter ${id} not found`);
  return { chapter: chapters[index], index };
}

export function panelOf(chapter: Chapter, id: string): Panel {
  const p = chapter.panels.find((x) => x.id === id);
  if (!p) throw new Error(`story-scenes: panel ${id} not found in chapter ${chapter.id}`);
  return p;
}

/** The first sentence of a panel's scene note: what the stage shows before the characters are drawn in. */
export const firstSentence = (s: string) => s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s;
