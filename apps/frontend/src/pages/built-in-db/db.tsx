import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import DbModal from './table/DbModal';
import { useDbModal } from '@/hooks/useDbModal';
import { Input } from '@/components/ui/input';
import { useTableStore } from '@/hooks/useTableStore';
import { cn } from '@/lib/cn';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DatabaseTable() {
  const dbModal = useDbModal();
  const { tables, removeTable, editTableName } = useTableStore();
  const [editTable, setEditTable] = useState({ id: '', name: '' });
  const [searchText, setSearchText] = useState('');

  const handleOnClick = () => {
    dbModal.onOpen();
  };

  const handleRemoveTable = (tableId) => {
    removeTable(tableId);
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
                          <span className="text-black">{table.name}</span>
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
        <h1 className="mt-6 pl-8 text-start font-bold">Tables</h1>
        {/* 
       // TODO 
        Add your table display logic here 
        */}
      </div>
    </div>
  );
}
