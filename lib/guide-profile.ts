import { AGE_OPTIONS, type Profile } from './personalized-catalog';
import type { PersonalSummary } from './personalized-types';
import { defaultProfile } from './personalized';

export function readProfile(search: string, summary: PersonalSummary): { profile: Profile; corrected: boolean } {
  const params = new URLSearchParams(search);
  const race = (params.get('race') || 'New York').trim().toLowerCase();
  const city = summary.cities.find(c => c.city.toLowerCase() === (['nyc', 'new york city'].includes(race) ? 'new york' : race));
  const age = (params.get('age') || 'all').replace(/[-—]/g, '–');
  const gender = (params.get('gender') || 'all').toLowerCase();
  const goal = Number(params.get('goal') || 180), previous = Number(params.get('previous'));
  const focus = params.get('focus') || 'prepare';
  const profile: Profile = {
    ...defaultProfile,
    city: city?.city || summary.cities[0].city,
    age: AGE_OPTIONS.includes(age) ? age : 'all',
    gender: gender === 'men' ? 'Men' : gender === 'women' ? 'Women' : 'all',
    goal: Number.isInteger(goal) && goal >= 150 && goal <= 270 ? goal : 180,
    previous: params.has('previous') && Number.isInteger(previous) && previous >= 120 && previous <= 720 ? previous : null,
    focus: ['prepare', 'choose', 'review'].includes(focus) ? focus as Profile['focus'] : 'prepare',
  };
  return { profile, corrected: (!!params.get('race') && !city) || !AGE_OPTIONS.includes(age)
    || !['men', 'women', 'all'].includes(gender) || profile.goal !== goal
    || (params.has('previous') && profile.previous === null) || profile.focus !== focus };
}

export function profileSearch(profile: Profile): string {
  const params = new URLSearchParams({ race: profile.city, age: profile.age, goal: String(profile.goal), gender: profile.gender, focus: profile.focus });
  if (profile.previous !== null) params.set('previous', String(profile.previous));
  return params.toString();
}

export function effectiveProfile(profile: Profile, summary: PersonalSummary): Profile {
  const city = summary.cities.find(c => c.city === profile.city);
  return { ...profile, age: city?.ages?.length === 0 ? 'all' : profile.age,
    gender: city?.genders && profile.gender !== 'all' && !city.genders.includes(profile.gender) ? 'all' : profile.gender };
}
