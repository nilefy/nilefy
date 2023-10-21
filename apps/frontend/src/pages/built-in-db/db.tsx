import { useEffect } from 'react';
import { ButtonWithIcon } from '@/components/built-in-db/ButtonWithIcon';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { useDbModal } from '@/hooks/useDbModal';
import { Dialog, DialogTitle, DialogContent, } from '@/components/ui/dialog';

import { useTableStore } from '@/hooks/useTableStore';
import { ArrowDownAZ, Filter, Pencil, Plus, Upload, } from "lucide-react";
import { useState } from 'react';
import DbModal from './create-table/DbModal';
import { DataShowTable } from '@/components/built-in-db/data-show-table';




// for  show table

interface RowData {
  id: number,
  name: string,
}
async function getData(): Promise<RowData[]> {
  // TODO : Fetch data from here
  return [
    {
      id: 0,
      name: "try",
    },
    // ...
  ]
}


export default  function DatabaseTable() {
  const dbModal = useDbModal();
  const { tables, clickedTable, setClickedTable, resetClickedTable, removeTable, editTableName } = useTableStore();
  const [editTable, setEditTable] = useState({ id: '', name: '' });
  // not imp. yet
  const [searchText, setSearchText] = useState('');
  // handle new row dialog,data , 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  const [data, setData] = useState<RowData[]>([]);
  // get  some def data for tabel
  useEffect(() => {
    const fetchData = async () => {
      const result = await getData();
      setData(result);
    };
    
    fetchData();
  }, []);
  const columns = clickedTable?.columns
    ? clickedTable.columns.map((column) => ({
      header: column.name,
      accessorKey: column.name.toLowerCase(),
    }))
    : [];
  

  const handleOnClick = () => {
    dbModal.onOpen();
  };

  const handleRemoveTable = (tableId) => {
    removeTable(tableId);
    resetClickedTable();
  };

  const handleEdit = (table) => {
    setEditTable({ id: table.id, name: table.name });
  };

  const handleSaveEdit = () => {
    if (editTable.id && editTable.name) {
      editTableName(editTable.id, editTable.name);
      setEditTable({ id: '', name: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditTable({ id: '', name: '' });
  };
  const handleTableClick = (table) => {
    // Close the modal if open
    dbModal.onClose();

    // Reset the editTable state
    setEditTable({ id: '', name: '' });

    // Update the clicked table state
    // Transform rows to cols and add empty rows
    const transformedTable = {
      ...table,
      columns: table.rows,
      rows: []
    };

    // Update the clicked table state
    console.log(transformedTable);
    setClickedTable(transformedTable);

    // Reset the current table state (if needed)
    // setCurrentTable(null);
  };
  const handleAddRow = () => {
    // Open the dialog
    setIsDialogOpen(true);
  }

  
  const handleDialogSubmit = () => {
    if (clickedTable) {
      // TODO: Add the new row to the table
      console.log("handling submit");
      
      // Close the dialog
      setIsDialogOpen(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };
  const onChange = (open: boolean) => {
    if (!open) {
      setIsDialogOpen(false);
    }
  };

  


  return (
    <div className="flex flex-row w-full h-full">
      <div className="w-1/4 bg-gray-200 h-screen min-w-[30%]">
        <div className="mx-auto w-5/6">
          <div className="flex flex-col items-center">
            <h1 className="mt-4 inline-flex self-start font-bold text-lg">Database</h1>
            <Button className="mt-6 w-full bg-black py-3 rounded-md sm:w-5/6" onClick={handleOnClick}>
              <span className="text-white">Create New Table</span>
            </Button>
            <DbModal isOpen={dbModal.isOpen} onOpen={dbModal.onOpen} onClose={dbModal.onClose} />
          </div>
          <div className="mt-6 flex flex-col items-center">
            <h4 className="inline-flex self-start text-gray-500 ">All Tables</h4>
            <div className="mt-4 w-full">
              <Input
                type="text"
                className="w-full"
                placeholder="Search Table"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <div className="mt-4">
                <ul className="flex flex-col">
                  {tables.map((table) => (
                    <li key={String(table.id)} className="flex flex-row items-center justify-between">
                      {table.id === editTable.id ? (
                        <div className="flex items-center">
                          <Input
                            type="text"
                            className="w-5/6 mr-2"
                            value={editTable.name}
                            onChange={(e) => setEditTable({ ...editTable, name: e.target.value })}
                          />
                          <Button onClick={handleSaveEdit} variant="secondary" >
                            Save
                          </Button>
                          <Button onClick={handleCancelEdit} variant="default" className='mx-2'>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div
                            className={`text-black cursor-pointer p-2 mt-2 rounded-md border-gray-300 w-full hover:bg-gray-100 ${clickedTable && clickedTable.id === table.id ? 'bg-blue-100' : ''
                              }`}
                            onClick={() => handleTableClick(table)}
                          >
                            <span className='text-sm'>{table.name}</span>
                          </div>
                          <div className="flex  items-center justify-center">
                            <DropdownMenu >
                              <DropdownMenuTrigger>
                                <span className='transform rotate-90 p-2 ' >...</span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="flex flex-col">
                                <DropdownMenuItem onClick={() => handleEdit(table)}>Edit</DropdownMenuItem>
                                {!editTable.id && (
                                  <DropdownMenuItem onClick={() => handleRemoveTable(table.id)}>Remove</DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-3/4 bg-gray-100 h-screen">
        <header className='table-info'>
          <h4 className="mt-6 pl-8 text-start font-600">
            {clickedTable ? "Tables > " + clickedTable.name : "Tables"}
          </h4>
        </header>
        {clickedTable && (
          <div className='w-full flex justify-center m-0'>
            <div className=" w-11/12 mt-4 flex justify-between">
              <div>
                {/* Add new column */}
                <ButtonWithIcon icon={<Plus size={20} />} text={"Add new Column"} size="sm" className='mr-4' onClick={() => handleAddColumn()} />
                {/* Add new row */}
                <ButtonWithIcon icon={<Plus size={20} />} text={"Add new Row"} size="sm" className='mr-4' onClick={() => handleAddRow()} />

                {/* Edit row */}
                <ButtonWithIcon icon={<Pencil size={20} />} text={"Edit row"} size="sm" className='mr-4' onClick={() => handleEditRow()} />

                {/* Bulk upload data */}
                <ButtonWithIcon icon={<Upload size={20} />} text={"Bulk upload data"} size="sm" className='mr-4' onClick={() => handleBulkUpload()} />
              </div>

              <div>
                {/* Filter */}
                <ButtonWithIcon icon={<Filter size={20} />} text={"Filter"} size="sm" className='mr-4' onClick={() => handleFilter()} />

                {/* Sort */}
                <ButtonWithIcon icon={<ArrowDownAZ size={20} />} text={"Filter"} size="sm" onClick={() => handleFilter()} />
              </div>
            </div>
          </div>)}
        <div className="w-full">
          <main className="w-full ">
            {clickedTable ? (
              <>
                <DataShowTable columns={columns} data={data} />
                {/* {JSON.stringify(columns)} {JSON.stringify(clickedTable.rows)} */}
              </>

            ): <div className = "flex justify-center items-center h-full">No data</div>}
      </main>
        </div>
        
      {/* // Dialog for adding a new row */}
        <Dialog open={isDialogOpen} onOpenChange={onChange}>
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
        </Dialog>

      </div >
    </div >
      );
}