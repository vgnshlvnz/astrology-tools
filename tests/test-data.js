import { assert } from './assert.js';

async function run() {
  try {
    const signs = await fetch('../shared/data/signs.json').then(r => r.json());
    assert(signs.length === 12, 'signs: 12 entries');
    assert(signs[0].id === 'mesha', 'signs[0] is mesha');
    assert(signs[0].position === 0, 'mesha position 0');
    assert(signs[3].id === 'kataka', 'signs[3] is kataka');
    assert(signs[4].id === 'simha', 'signs[4] is simha');
    assert(signs[9].id === 'makara', 'signs[9] is makara');
    assert(signs.every(s => ['id','tamil','english','ruler','element','position'].every(k => k in s)), 'signs: all required fields');

    const planets = await fetch('../shared/data/planets.json').then(r => r.json());
    assert(planets.length === 9, 'planets: 9 entries');
    const surya = planets.find(p => p.id === 'surya');
    assert(surya.owns[0] === 'simha', 'surya owns simha');
    assert(surya.shadow === false, 'surya not shadow');
    const rahu = planets.find(p => p.id === 'rahu');
    assert(rahu.shadow === true, 'rahu is shadow');
    assert(rahu.owns.length === 0, 'rahu owns nothing');
    assert(planets.every(p => 'ownership_annotation' in p), 'planets: ownership_annotation field exists');

    const elements = await fetch('../shared/data/elements.json').then(r => r.json());
    assert(elements.length === 4, 'elements: 4 entries');
    assert(elements.every(e => e.signs.length === 3), 'each element has 3 signs');

    const houses = await fetch('../shared/data/houses.json').then(r => r.json());
    assert(houses.length === 12, 'houses: 12 entries');
    assert(houses[0].id === 1, 'first house id is 1');
    assert(houses.every(h => ['tamil','english_keywords','example_question'].every(k => k in h)), 'houses: required fields');

    const ann = await fetch('../shared/data/annotations.json').then(r => r.json());
    assert(typeof ann.ownership_master === 'string', 'annotations: ownership_master');
    assert(typeof ann.elements_master === 'string', 'annotations: elements_master');

    console.log('=== All data tests passed ===');
  } catch (e) {
    console.error('Data tests failed:', e.message);
  }
}
run();
