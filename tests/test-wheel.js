import { computeSectors } from '../shared/wheel.js';
import { assert, assertClose } from './assert.js';

try {
  const s = computeSectors(400, 400, 340, 180);
  assert(s.length === 12, 'wheel: 12 sectors');
  assertClose(s[0].centerDeg, 0,   'mesha at 0deg (3 oclock)');
  assertClose(s[3].centerDeg, 270, 'kataka at 270deg (12 oclock)');
  assertClose(s[4].centerDeg, 240, 'simha at 240deg (upper-left)');
  assertClose(s[9].centerDeg, 90,  'makara at 90deg (6 oclock)');
  assertClose(s[3].centerDeg - s[4].centerDeg, 30, 'kataka and simha 30deg apart');
  assertClose(s[9].centerDeg - s[10].centerDeg, 30, 'makara and kumbha 30deg apart');
  const labelR = (340 + 180) / 2;
  assertClose(s[0].labelX, 400 + labelR, 'mesha labelX at east');
  assertClose(s[0].labelY, 400,          'mesha labelY at center');
  assert(s.every(x => ['centerDeg','leadDeg','trailDeg','pathData','labelX','labelY'].every(k => k in x)), 'all geometry fields present');
  console.log('=== All wheel tests passed ===');
} catch (e) {
  console.error('Wheel tests failed:', e.message);
}
