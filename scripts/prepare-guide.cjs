// Build smaller, content-addressed views of the already public aggregates.
// Source packs and their provenance stay unchanged. Every view is reproducible.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const folder = path.resolve(__dirname, '../public/data/packs/ext_personalized_guide');
const output = path.resolve(__dirname, '../public/data/guide');
function prepareGuide() {
  if (!fs.existsSync(path.join(folder, 'summary.json'))) return;
  fs.mkdirSync(output, { recursive: true });
  const summary = JSON.parse(fs.readFileSync(path.join(folder, 'summary.json'), 'utf8'));
  const write = value => {
    const content = JSON.stringify(value) + '\n';
    const name = crypto.createHash('sha256').update(content).digest('hex') + '.json';
    if (!fs.existsSync(path.join(output, name))) fs.writeFileSync(path.join(output, name), content);
    return name;
  };
  for (const city of summary.cities) {
    const data = JSON.parse(fs.readFileSync(path.join(folder, 'tables', city.file), 'utf8'));
    const cohorts = Object.values(data.cohorts);
    city.ages = [...new Set(cohorts.map(c => c.age).filter(a => a !== 'all'))];
    city.genders = [...new Set(cohorts.map(c => c.gender).filter(g => g !== 'all'))];
    city.editions = data.cohorts['all|all|all']?.editions || 0;
    city.limited = city.city !== 'All courses' && (city.n < 1000 || city.editions < 3);
    city.profile_files = {};
    const nearFiles = {};
    for (let bucket = 150; bucket <= 270; bucket += 15) {
      const selected = Object.fromEntries(Object.entries(data.cohorts).map(([key, c]) => [key, {
        ...c, pace: [], near: [], profiles: c.profiles[bucket] ? { [bucket]: c.profiles[bucket] } : {},
        gains: c.gains[bucket] ? { [bucket]: c.gains[bucket] } : {},
      }]));
      city.profile_files[bucket] = write({ city: city.city, cohorts: selected, terrain: data.terrain });
    }
    for (let target = 150; target <= 270; target++) {
      const near = Object.fromEntries(Object.entries(data.cohorts).flatMap(([key, c]) => {
        const row = c.near.find(r => r.target === target);
        return row ? [[key, [row]]] : [];
      }));
      nearFiles[target] = write({ city: city.city, target, near });
    }
    city.near_index = write({ city: city.city, files: nearFiles });
    const checkpoint = JSON.parse(fs.readFileSync(path.join(folder, 'tables', city.checkpoint_file), 'utf8'));
    const groups = {};
    for (const row of checkpoint.rows) (groups[`${row.checkpoint}:${row.elapsed}`] ||= []).push(row);
    city.checkpoint_index = write({ city: city.city, files: Object.fromEntries(Object.entries(groups).map(([key, rows]) => [key, write({ city: city.city, rows })])) });
  }
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(summary) + '\n');
  return summary;
}
if (require.main === module) { prepareGuide(); console.log('Prepared content-addressed guide comparisons.'); }
module.exports = { prepareGuide };
