// useTableStore.ts
import { create } from 'zustand';
import zukeeper from 'zukeeper';
import { Record } from '@/pages/built-in-db/table/columns';

interface Table {
  id: string;
  name: string;
  rows: Record[];
}

interface TableStore {
  tables: Table[];
  currentTable: Table | null;
  setCurrentTable: (table: Table | null) => void;
  addTable: (table: Table) => void;
  removeTable: (tableId: string) => void;
  resetCurrentTable: () => void;
  editTableName: (tableId: string, newName: string) => void; // New function to edit table name
}

export const useTableStore = create<TableStore>((set) => ({
  tables: [],
  currentTable: null,
  setCurrentTable: (table) => set({ currentTable: table }),
  addTable: (table) => set((state) => ({ tables: [...state.tables, table], currentTable: table })),
  removeTable: (tableId: string) =>
    set((state) => ({
      tables: state.tables.filter((table) => table.id !== tableId),
      currentTable: state.currentTable?.id === tableId ? null : state.currentTable,
    })),
  resetCurrentTable: () => set({ currentTable: null }),
  editTableName: (tableId: string, newName: string) =>
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === tableId ? { ...table, name: newName } : table
      ),
      currentTable: state.currentTable?.id === tableId ? { ...state.currentTable, name: newName } : state.currentTable,
    })),
}));
