import { createColumnHelper } from "@tanstack/react-table";
import { ColumnDef } from "@tanstack/react-table";

export type Column = {
  id: string;
  name: string;
  type: string;
  default: string;
};


const columnHelper = createColumnHelper();
    // const columns = getColumns([
    //   { id: 1, name: 'id', type: 'serial', default: 'default' },
    // ]);

// export const getColumns = (columnsData:Column[])=> {
//   return columnsData.map((column:Column, index:number) => {
//     return columnHelper.accessor(column.id, {
//       header: column.name, // Use the column name as the header
//     });
//   });
// };