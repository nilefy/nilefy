import { MouseEvent } from 'react';
export const EditCell = ({ row, table }) => {
  const meta = table.options.meta;
  const setEditedRows = (e: MouseEvent<HTMLButtonElement>) => {
    meta?.setEditedRows((old: []) => ({
      ...old,
      [row.id]: !old[row.id],
    }));
  };
  const removeRow = () => {
    meta?.removeRow(row.index);
  };

  if (row.index == 0) {
    return 'Primary Key';
  }
  return (
    <div className="edit-cell-container">
      <div className="edit-cell-action">
        <button onClick={removeRow} name="remove">
          X
        </button>
      </div>
    </div>
  );
};
