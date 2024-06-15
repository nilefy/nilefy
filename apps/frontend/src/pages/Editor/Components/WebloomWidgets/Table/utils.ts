import { NilefyRowData, NilefyTableColumn } from '.';

/**
 * Helper function to generate columns from data
 */
export const generateColumnsFromData = (
  data: NilefyRowData[] | undefined,
): NilefyTableColumn[] => {
  if (!data) return [];
  // generate columns based on all data elements
  const keys = data.reduce((acc, row) => {
    return acc.concat(Object.keys(row));
  }, [] as string[]);
  // remove duplicates
  const uniqueKeys = Array.from(new Set(keys));
  return uniqueKeys.map((key, index) => {
    return {
      id: (index + 1).toString(),
      accessorKey: key,
      header: key,
      name: key,
      type: 'Default',
    };
  });
};
