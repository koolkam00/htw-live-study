import RunnerSearch from '@/components/RunnerSearch';

export const metadata = {
  title: 'Find your races | Marathon Pacing Study',
  description: 'Search recorded runner names, choose your race results, and explore your finish times and pacing through the marathon.',
};

export default function RunnersPage() {
  return <RunnerSearch />;
}
