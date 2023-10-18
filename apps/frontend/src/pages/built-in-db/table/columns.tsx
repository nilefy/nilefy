import { useMemo } from "react"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { TableCell } from "@/components/ui/table"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Record = {
  name: string
  type: string
  default: string;
}
// const columnHelper = createColumnHelper<Record>();
// export   const columns = useMemo<ColumnDef<Record, string>[]>(
//   () => [
//     columnHelper.accessor("name", {
//       header: "Name",
//       footer: "Name",
//     }),
//     columnHelper.accessor("type", {
//       header: "Type",
//       footer: "Type",
//     }),
//     columnHelper.accessor("default", {
//       header: "default",
//       footer: "default",
//     }),
// ],
//   []
// )
export const columns: ColumnDef<Record, string>[] = []

