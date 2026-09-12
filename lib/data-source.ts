/** Source labels identify the actual imported snapshot, including same-day exports. */
export const sourceReleaseTag = (exportId: string) => exportId.replace(/^private-(\d{8}-\d{4})$/, 'private-export-$1');
export const sourceReleaseHref = (exportId: string) => 'https://github.com/koolkam00/htw-live-study/releases/tag/' + encodeURIComponent(sourceReleaseTag(exportId));
export const sourceDate = (asOf: string) => new Date(asOf).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
export const sourceLabel = (asOf: string, exportId: string) => `${sourceDate(asOf)} · ${sourceReleaseTag(exportId)}`;
