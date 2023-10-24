// useTableStore.ts
import { Record } from '@/pages/built-in-db/create-table/columns';
import { create } from 'zustand';

interface Table {
  id: string;
  name: string;
  rows: Record[];
}
export interface clickedTable extends Table {
  columns: Record[];
}

interface TableStore {
  tables: Table[];
  clickedTable: clickedTable | null;
  setClickedTable: (table: clickedTable | null) => void;
  resetClickedTable: () => void;
  currentTable: Table | null;
  setCurrentTable: (table: Table | null) => void;
  resetCurrentTable: () => void;
  addTable: (table: Table) => void;
  removeTable: (tableId: string) => void;
  editTableName: (tableId: string, newName: string) => void; // New function to edit table name
}

export const useTableStore = create<TableStore>((set) => ({
  tables: [],
  clickedTable: null,
  setClickedTable: (table) => set({ clickedTable: table }),
  resetClickedTable: () => set({ clickedTable: null }),
  currentTable: null,
  setCurrentTable: (table) => set({ currentTable: table }),
  addTable: (table) =>
    set((state) => ({ tables: [...state.tables, table], currentTable: table })),
  removeTable: (tableId: string) =>
    set((state) => ({
      tables: state.tables.filter((table) => table.id !== tableId),
      currentTable:
        state.currentTable?.id === tableId ? null : state.currentTable,
    })),
  resetCurrentTable: () => set({ currentTable: null }),
  editTableName: (tableId: string, newName: string) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === tableId ? { ...table, name: newName } : table,
      ),
      currentTable:
        state.currentTable?.id === tableId
          ? { ...state.currentTable, name: newName }
          : state.currentTable,
    })),
}));
