import { createColumnHelper } from "@tanstack/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { VarCell } from "@/components/built-in-db/var-cell";
import { EditCell } from "@/components/built-in-db/edit-cell";

export type Record = {
  name: string;
  type: string;
  default: string;
};

const columnHelper = createColumnHelper<Record>();

const getColumns: ColumnDef<Record, keyof Record>[] = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: VarCell,
    meta: {
      type: "text",
    },
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: VarCell,
    meta: {
      type: "select",
      options: [
        { value: "varchar", label: "varchar" },
        { value: "int", label: "int" },
        { value: "bigint", label: "bigint" },
        { value: "float", label: "float" },
        { value: "boolean", label: "boolean" },
      ],
    },
  }),
  columnHelper.accessor("default", {
    header: "Default",
    cell: VarCell,
    meta: {
      type: "text",
    },
  }),
  columnHelper.display({
    header: "",
    id: "edit",
    cell: EditCell,
  }),
];

export default getColumns;
