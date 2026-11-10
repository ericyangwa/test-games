#!/usr/bin/env node
// Generates Polyglot's audio clips with Azure text-to-speech, once, so every player hears the same file.
//
//   AZURE_SPEECH_KEY=...  AZURE_SPEECH_REGION=eastus  node tools/polyglot-tts.mjs
//
// Options:
//   --dry-run        list what would be generated and the character count; needs no key
//   --only A,B       only these languages (names as in the game, e.g. --only Spanish,Thai)
//   --force          regenerate clips that already exist
//
// Reads the sentences straight from games/polyglot/index.html, writes MP3s to games/polyglot/clips/,
// then rewrites clips/manifest.json from the files on disk. The game only uses puzzles listed there.
// Never commit the key: pass it in the environment for the one run.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const gameDir = join(root, 'games', 'polyglot');
const clipDir = join(gameDir, 'clips');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const onlyArg = args[args.indexOf('--only') + 1];
const only = args.includes('--only') && onlyArg ? new Set(onlyArg.split(',').map(s => s.trim())) : null;

// Preferred voices, all female so the voice itself is never a clue. If one is missing in your
// region the script falls back to another neural voice for the same locale.
const PREFERRED = {
  'es-ES':'es-ES-ElviraNeural', 'fr-FR':'fr-FR-DeniseNeural', 'de-DE':'de-DE-KatjaNeural', 'it-IT':'it-IT-ElsaNeural',
  'pt-BR':'pt-BR-FranciscaNeural', 'ru-RU':'ru-RU-SvetlanaNeural', 'ja-JP':'ja-JP-NanamiNeural', 'zh-CN':'zh-CN-XiaoxiaoNeural',
  'ko-KR':'ko-KR-SunHiNeural', 'ar-SA':'ar-SA-ZariyahNeural', 'hi-IN':'hi-IN-SwaraNeural', 'nl-NL':'nl-NL-FennaNeural',
  'sv-SE':'sv-SE-SofieNeural', 'nb-NO':'nb-NO-PernilleNeural', 'da-DK':'da-DK-ChristelNeural', 'pl-PL':'pl-PL-ZofiaNeural',
  'cs-CZ':'cs-CZ-VlastaNeural', 'el-GR':'el-GR-AthinaNeural', 'tr-TR':'tr-TR-EmelNeural', 'vi-VN':'vi-VN-HoaiMyNeural',
  'th-TH':'th-TH-PremwadeeNeural', 'he-IL':'he-IL-HilaNeural', 'id-ID':'id-ID-GadisNeural', 'fi-FI':'fi-FI-NooraNeural',
  'uk-UA':'uk-UA-PolinaNeural', 'ro-RO':'ro-RO-AlinaNeural', 'hu-HU':'hu-HU-NoemiNeural', 'fa-IR':'fa-IR-DilaraNeural',
  'fil-PH':'fil-PH-BlessicaNeural', 'sw-KE':'sw-KE-ZuriNeural', 'bn-IN':'bn-IN-TanishaaNeural', 'ta-IN':'ta-IN-PallaviNeural',
  'ka-GE':'ka-GE-EkaNeural', 'is-IS':'is-IS-GudrunNeural', 'cy-GB':'cy-GB-NiaNeural', 'ga-IE':'ga-IE-OrlaNeural',
  'ca-ES':'ca-ES-JoanaNeural', 'eu-ES':'eu-ES-AinhoaNeural', 'am-ET':'am-ET-MekdesNeural', 'zu-ZA':'zu-ZA-ThandoNeural',
  'sr-RS':'sr-RS-SophieNeural',
};

// ---------- read the puzzles out of the game ----------
const html = readFileSync(join(gameDir, 'index.html'), 'utf8');
const m = html.match(/const P = (\[[\s\S]*?\n\]);/);
if (!m) throw new Error('Could not find the puzzle list (const P = [...]) in games/polyglot/index.html');
const P = new Function('return ' + m[1])();
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const jobs = [];
for (const p of P) {
  if (only && !only.has(p.lang)) continue;
  p.s.forEach((text, i) => jobs.push({ lang: p.lang, tag: p.tts, i, text, file: `${slug(p.lang)}-${i}.mp3` }));
}
if (only) for (const name of only) if (!P.some(p => p.lang === name)) console.warn(`warning: no puzzle language called "${name}"`);

const chars = jobs.reduce((n, j) => n + j.text.length, 0);
console.log(`${jobs.length} sentences in ${new Set(jobs.map(j => j.lang)).size} languages, ${chars} characters.`);

// ---------- manifest ----------
function writeManifest() {
  if (!existsSync(clipDir)) return {};
  const files = new Set(readdirSync(clipDir));
  const manifest = {};
  for (const p of P) p.s.forEach((_, i) => { const f = `${slug(p.lang)}-${i}.mp3`; if (files.has(f)) manifest[`${p.lang}-${i}`] = f; });
  writeFileSync(join(clipDir, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
  return manifest;
}

if (dryRun) {
  for (const j of jobs) console.log(`  ${existsSync(join(clipDir, j.file)) ? 'have' : 'make'}  ${j.tag.padEnd(6)} ${j.file}`);
  process.exit(0);
}

// ---------- Azure ----------
const key = process.env.AZURE_SPEECH_KEY, region = process.env.AZURE_SPEECH_REGION;
const base = process.env.AZURE_SPEECH_ENDPOINT || (region && `https://${region}.tts.speech.microsoft.com`);
if (!key || !base) {
  console.error('Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION (from your Azure Speech resource), or use --dry-run.');
  process.exit(1);
}
const headers = { 'Ocp-Apim-Subscription-Key': key, 'User-Agent': 'polyglot-tts' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

async function request(url, opts) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, opts);
    if (res.ok) return res;
    if ((res.status === 429 || res.status >= 500) && attempt < 6) {
      const wait = (+res.headers.get('retry-after') || attempt * 3) * 1000;
      console.log(`  ${res.status}, retrying in ${wait / 1000}s`);
      await sleep(wait); continue;
    }
    throw new Error(`${res.status} ${res.statusText}: ${(await res.text()).slice(0, 300)}`);
  }
}

const voices = await (await request(`${base}/cognitiveservices/voices/list`, { headers })).json();
function pickVoice(tag) {
  const here = voices.filter(v => v.Locale === tag && !/Multilingual/i.test(v.ShortName));
  return here.find(v => v.ShortName === PREFERRED[tag])
      || here.find(v => v.Gender === 'Female' && v.VoiceType === 'Neural')
      || here.find(v => v.VoiceType === 'Neural') || here[0] || null;
}

mkdirSync(clipDir, { recursive: true });
const missing = [];
let made = 0, kept = 0;
for (const j of jobs) {
  const out = join(clipDir, j.file);
  if (existsSync(out) && !force) { kept++; continue; }
  const v = pickVoice(j.tag);
  if (!v) { missing.push(`${j.lang} (${j.tag})`); continue; }
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${j.tag}">` +
    `<voice name="${v.ShortName}"><prosody rate="-5%">${esc(j.text)}</prosody></voice></speak>`;
  const res = await request(`${base}/cognitiveservices/v1`, { method: 'POST', body: ssml, headers: {
    ...headers, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3' } });
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(out, buf);
  made++;
  console.log(`  made  ${j.file.padEnd(16)} ${v.ShortName.padEnd(26)} ${(buf.length / 1024).toFixed(0)} KB`);
  await sleep(350); // stay under the free tier's request rate
}
const manifest = writeManifest();
console.log(`\nMade ${made}, kept ${kept} existing. manifest.json lists ${Object.keys(manifest).length} clips.`);
if (missing.length) console.log(`No voice in this region for: ${[...new Set(missing)].join(', ')}. Those sentences stay out of the game.`);
