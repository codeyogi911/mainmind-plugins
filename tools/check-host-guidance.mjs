// Source guidance guard; package checks never prove installed-host delivery.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
const PACKAGES=['mainmind','mainmind-codex','mainmind-mount','mainmind-grok','mainmind-muse'];
export function hostGuidanceSnapshot(root) {
  const read=path=>readFileSync(join(root,path),'utf8');
  return {startup:read('skills/mainmind-start/SKILL.md'),guide:read('HOST-COMPATIBILITY.md'),grok:read('plugins/mainmind-grok/config.toml'),muse:read('plugins/mainmind-muse/SUBMISSION.md'),readmes:Object.fromEntries(PACKAGES.map(name=>[name,read(`plugins/${name}/README.md`)]))};
}
export function hostGuidanceProblems(snapshot) {
  const errors=[],flat=value=>value.replace(/\s+/g,' ');
  const startup=flat(snapshot.startup),guide=flat(snapshot.guide);
  if(!/actual tools and permissions/i.test(startup) || !/Do not infer shell, filesystem or Git access from an app's name/.test(startup))errors.push('startup: choose execution by actual session tools, not the app name');
  if(/(?:Muse|ChatGPT|Grok Bot|Claude chat) (?:has|have) no shell/i.test(flat(Object.values(snapshot.readmes).join(' '))))errors.push('host guidance: an app name must not decide execution capabilities');
  if(!/After reconnecting, rediscover and verify/.test(startup) || !/original idempotency key/.test(startup))errors.push('startup: reconnect identity and uncertain-write recovery must remain explicit');
  if(!/callback acceptance, consumer acknowledgment and a reply/.test(startup))errors.push('startup: distinguish retained, accepted, consumed and replied evidence');
  if(/Grok Build has no plugin manifest format/i.test(snapshot.grok))errors.push('Grok config: the shipped manifest exists; TOML is the alternate route');
  if(/privacy and terms pages[\s\S]{0,180}need to exist/i.test(snapshot.muse))errors.push('Muse dossier: existing legal pages need facts, not an invented absence');
  if(!/20 October 2026/.test(guide) || !guide.includes('https://developers.openai.com/plugins/build/mcp-events') || !guide.includes('https://code.claude.com/docs/en/channels-reference'))errors.push('compatibility: retain the check date and separate primary event/channel references');
  if(!/does \*\*not register a channel server\*\* that negotiates `2026-07-28`/.test(guide))errors.push('compatibility: a blanket 2026-07-28 channel upgrade is unsupported');
  for(const [name,readme] of Object.entries(snapshot.readmes)) {
    if(!readme.includes('https://github.com/codeyogi911/mainmind-plugins/blob/main/HOST-COMPATIBILITY.md'))errors.push(`${name}: the standalone package needs the absolute compatibility reference`);
    if(/Grok Bot.{0,100}takes (?:its )?plugins from Cursor's marketplace/i.test(flat(readme)))errors.push(`${name}: do not claim unverified Grok Bot loading from Cursor metadata`);
  }
  return errors;
}
export function testHostGuidance(snapshot) {
  assert.deepEqual(hostGuidanceProblems(snapshot),[],'the shipped guidance must pass');
  const cases=[
    ['brand-based execution',s=>{s.readmes['mainmind-muse']+='\nMuse has no shell.';},/execution capabilities/],
    ['lost capability check',s=>{s.startup=s.startup.replace('actual tools and permissions','usual product capabilities');},/actual session tools/],
    ['reconnect without identity',s=>{s.startup=s.startup.replace('After reconnecting, rediscover','After reconnecting, continue');},/reconnect identity/],
    ['blind write retry',s=>{s.startup=s.startup.replace('original\nidempotency key','new\nidempotency key');},/uncertain-write recovery/],
    ['accepted is not consumed',s=>{s.startup=s.startup.replace('callback acceptance, consumer acknowledgment and a reply','delivery');},/consumed/],
    ['old Grok comment',s=>{s.grok+='\n# Grok Build has no plugin manifest format.';},/shipped manifest/],
    ['lost protocol boundary',s=>{s.guide=s.guide.replace('does **not register a channel server**','registers a channel server');},/blanket/],
    ['unverified Bot package',s=>{s.readmes['mainmind-mount']+="\nGrok Bot takes its plugins from Cursor's marketplace.";},/unverified Grok Bot/],
    ['package without reference',s=>{s.readmes.mainmind=s.readmes.mainmind.replace('https://github.com/codeyogi911/mainmind-plugins/blob/main/HOST-COMPATIBILITY.md','../../HOST-COMPATIBILITY.md');},/compatibility reference/],
  ];
  for(const [label,mutate,reason] of cases){const changed=structuredClone(snapshot);mutate(changed);assert.match(hostGuidanceProblems(changed).join('\n'),reason,label);}
  return cases.length;
}
