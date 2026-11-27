// Maps a shopfront box measured on the SOURCE clip frame (fractions, may overflow 0..1)
// into fractions of the cut frame, after the cover-scale + centre-crop the extractor applies.
export function frontToCut([l, t, fw, fh], [sw, sh], [w, h]) {
  const s = Math.max(w / sw, h / sh);
  const W = sw * s;
  const H = sh * s;
  return [(l * W - (W - w) / 2) / w, (t * H - (H - h) / 2) / h, (fw * W) / w, (fh * H) / h];
}

// The coded front is 4096x3089 art: frame 0's front box must keep that aspect or the handoff misaligns.
export const FRONT_ASPECT = 4096 / 3089;

/**
 * Relative aspect error of a cut-frame front box (fractions) on a w x h cut, against the coded front.
 * @param {number[]} front l,t,w,h
 * @param {number[]} size w,h
 */
export function frontAspectError([, , fw, fh], [w, h]) {
  return Math.abs((fw * w) / (fh * h) / FRONT_ASPECT - 1);
}
