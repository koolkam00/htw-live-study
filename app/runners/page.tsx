import RunnerSearch from '@/components/RunnerSearch';

export const metadata = {
  title: 'Find your races | Marathon Pacing Study',
  description: 'Search every named race record, including incomplete results. View recorded finishes and explore pacing, peers, weather and elevation where data is available.',
};

export default function RunnersPage() {
  return <RunnerSearch />;
}
