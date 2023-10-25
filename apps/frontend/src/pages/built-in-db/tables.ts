const tables = [
  {
    id: 1,
    name: 'users',
    columns: [
      {
        id: 1,
        name: 'id',
        type: 'serial',
        default: 'NULL',
      },
      {
        id: 2,
        name: 'name',
        type: 'varchar',
        default: 'NULL',
      },
      {
        id: 3,
        name: 'email',
        type: 'varchar',
        default: 'NULL',
      },
      {
        id: 4,
        name: 'password',
        type: 'varchar',
        default: 'NULL',
      },
    ],
  },
  {
    id: 2,
    name: 'posts',
    columns: [
      {
        id: 1,
        name: 'id',
        type: 'serial',
        default: 'NULL',
      },
      {
        id: 2,
        name: 'title',
        type: 'varchar',
        default: 'NULL',
      },
      {
        id: 3,
        name: 'body',
        type: 'varchar',
        default: 'NULL',
      },
      {
        id: 4,
        name: 'user_id',
        type: 'int',
        default: 'NULL',
      },
    ],
  },
];
interface Column {
  id: number;
  name: string;
  type: string;
  default: string | number | null;
}
interface Table {
  id: number;
  name: string;
  columns: Column[];
}

export const fetchTables = async (query = ""): Promise<Table[]> => {
  console.log('fetching tables');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return tables;
};

export const addTable = async (table: Table): Promise<Table> => {
  console.log('adding table');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Perform actual addition logic here
  tables.push(table); // Assuming you're adding to the existing tables array
  return table;
};

export const removeTable = async (tableId: number): Promise<void> => {
  console.log('removing table');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Assuming tables is an array and you want to remove the table with the specified ID
  const index = tables.findIndex((table) => table.id === tableId);
  if (index !== -1) {
    tables.splice(index, 1);
  }
};

export const renameTable = async (
  tableId: number,
  newName: string,
): Promise<void> => {
  console.log('renaming table');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Assuming tables is an array and you want to rename the table with the specified ID
  const table = tables.find((table) => table.id === tableId);
  if (table) {
    table.name = newName;
  }
};
