const { spawnSync } = require('child_process');
const path = require('path');

console.log('This repository is now configured for Remotion Cloud (no local headless rendering).');
console.log('Use the helper scripts to create a cloud bundle and per-song inputProps for job creation.');
console.log('Commands:');
console.log('  1) Create bundle (include audio): INCLUDE_AUDIO=1 node scripts/bundle-and-zip.js');
console.log('  2) Generate per-song inputProps: node scripts/generate-inputprops.js');

// If the user set AUTO=1, run both steps automatically (conservative defaults).
if (process.env.AUTO === '1') {
  console.log('\nAUTO=1 detected — running bundle + inputprops generator...');

  const includeAudio = (process.env.INCLUDE_AUDIO === '1' || process.env.INCLUDE_AUDIO === 'true') ? '1' : '0';
  const env = Object.assign({}, process.env, { INCLUDE_AUDIO: includeAudio });

  console.log('Running: node scripts/bundle-and-zip.js');
  const res1 = spawnSync('node', [path.join('scripts', 'bundle-and-zip.js')], { stdio: 'inherit', env });
  if (res1.status !== 0) {
    console.error('bundle-and-zip.js failed — aborting.');
    process.exit(res1.status || 1);
  }

  console.log('Running: node scripts/generate-inputprops.js');
  const res2 = spawnSync('node', [path.join('scripts', 'generate-inputprops.js')], { stdio: 'inherit', env });
  if (res2.status !== 0) {
    console.error('generate-inputprops.js failed.');
    process.exit(res2.status || 1);
  }

  console.log('\nDone — upload `cloud-bundle.zip` to Remotion Cloud and use JSON files in `scripts/inputprops/` for jobs.');
}
