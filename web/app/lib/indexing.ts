/**
 * A directory page is a letter or brand listing. One ROM-covered row is a
 * duplicate of that device page; two or more make the page a useful list.
 */
export const MIN_DIRECTORY_ROMS = 2;

export function isUsefulDirectoryPage(withRoms: number): boolean {
  return withRoms >= MIN_DIRECTORY_ROMS;
}
