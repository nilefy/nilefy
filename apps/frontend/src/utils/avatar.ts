/**
 * depends that the length of `str` is atleast 1 and split by spaces
 *
 * TODO: handle other spliters than space
 */
export function getInitials(str: string) {
  const splits = str.split(' ', 2);
  return `${splits[0][0]}${splits[1]?.[0] ?? ''}`;
}
