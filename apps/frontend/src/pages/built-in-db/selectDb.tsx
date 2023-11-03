import { Button } from '@/components/ui/button';
import { DataShowTable } from '@/components/built-in-db/data-show-table';
import {
  Plus,
  Pencil,
  Upload,
  Filter,
  ArrowDownAZ,
  Loader,
} from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTable } from './tables';
import { useQuery } from '@tanstack/react-query';

export default function SelectDb() {
  const { tableId } = useParams();
  const currentTableId = parseInt(tableId || '0');

  const {
    data: currentTable,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => fetchTable(currentTableId),
    queryKey: ['currentTable', currentTableId],
  });

  // TODO: handle new row dialog,data ,
  const [isAddRowDialogOpen, setIsAddRowDialogOpen] = useState(false);
  const [newRowData, setNewRowData] = useState({});

  if (isLoading) {
    return (
      <div className="mx-auto flex flex-col items-center justify-center">
        <div></div>
        <Loader className="h-32 w-32 animate-spin " />
        <div className="mt-4">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto flex flex-col items-center justify-center">
        <div className="mt-4">
          <h2>Couldn't Find This Table... :(</h2>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-primary/5 h-screen w-3/4">
      <header className="table-info">
        <h1 className="mt-6 pl-8 text-start ">
          {currentTableId !== 0
            ? `Tables > ${currentTable?.name || ''}`
            : 'Tables'}
        </h1>
      </header>
      {currentTableId != 0 && (
        <div className="m-0 flex w-full justify-center">
          <div className=" mt-4 flex w-11/12 justify-between">
            <div>
              {/* Add new column */}
              <Button
                size="sm"
                className="mr-4"
                onClick={() => handleAddColumn()}
              >
                <Plus size={20} />
                <span className="ml-2">Add New Column</span>
              </Button>
              {/* Add new row */}
              <Button size="sm" className="mr-4" onClick={() => handleAddRow()}>
                <Plus size={20} />
                <span className="ml-2">Add New Row</span>
              </Button>

              {/* Edit row */}
              <Button
                size="sm"
                className="mr-4"
                onClick={() => handleEditRow()}
              >
                <Pencil size={20} />
                <span className="ml-2">Edit Row</span>
              </Button>

              {/* Bulk upload data */}
              <Button
                size="sm"
                className="mr-4"
                onClick={() => handleBulkUpload()}
              >
                <Upload size={20} />
                <span className="ml-2">Bulk Upload </span>
              </Button>
            </div>

            <div>
              {/* Filter */}
              <Button size="sm" className="mr-4" onClick={() => handleFilter()}>
                <Filter size={20} />
                <span className="ml-2">Filter</span>
              </Button>

              {/* Sort */}
              <Button size="sm" onClick={() => handleFilter()}>
                <ArrowDownAZ size={20} />
                <span className="ml-2">Sort</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="m-0 flex w-full justify-center">
        <main className="h-full w-[95%] ">
          {currentTableId != 0 ? (
            <div className="flex h-full w-full items-center justify-center">
              <DataShowTable defColumns={currentTable?.columns || []} />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              No data
            </div>
          )}
        </main>
      </div>

      {/* // Dialog for adding a new row */}
      {/* <Dialog open={isAddRowDialogOpen} onOpenChange={onChange}>
        <DialogContent>
          <DialogTitle>Enter Row Data</DialogTitle>
          {clickedTable?.columns.map((column) => (
              <div key={column.name} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{column.name}</label>
                <Input
                  disabled={column.name === "id"}
                  type="text"
                  value={column.name==="id"?clickedTable.rows.length+1:newRowData[column.name]}
                  onChange={(e) => setNewRowData({ ...newRowData, [column.name]: e.target.value })}
                />
              </div>
            ))}
          <div>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleDialogSubmit}>Submit</Button>
          </div>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
