import RunnerSearch from '@/components/RunnerSearch';

export const metadata = {
  title: 'Find your races | Marathon Pacing Study',
  description: 'Find your recorded races and compare pacing, age and gender peers, weather and supplied course elevation.',
};

export default function RunnersPage() {
  return <RunnerSearch />;
}
