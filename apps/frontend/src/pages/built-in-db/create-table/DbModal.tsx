import React, { useMemo } from 'react'
import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import { DataCreateTable } from '@/components/built-in-db/data-creation-table';
import { useTableStore } from '@/hooks/useTableStore';
import columns from './columns';

interface DbModalProps {
  isOpen: boolean,
  onOpen: () => void
  onClose: () => void
}
// getting Data
const getData = () => {
  return [
    {
      name: "id",
      type: "serial",
      default: "NULL",
    },
    {
      name: "Name",
      type: "varchar",
      default: "NULL",
    }
  ]
}


export default function DbModal({ isOpen, onOpen, onClose }: DbModalProps) {
  const [data, setData] = useState(getData());
  const tableStore = useTableStore();
  const [tableName, setTableName] = useState("");
  const handleTableNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableName(e.target.value);
  };

  // const form = useForm<z.infer<typeof formSchema>>({
  //     resolver: zodResolver(formSchema),
  //     defaultValues:{
  //         name: "",
  //     },
  // });

  const onSubmit = async () => {
    // Save the table to the store
    if (tableStore.currentTable) tableStore.addTable(tableStore.currentTable);
    // console.log(tableStore.currentTable);
    
    // Close the modal
    onClose();
    // Reset the table
    tableStore.resetCurrentTable();
    // Reset the table name
    setTableName("");
  };

  return (
    <Modal
      title="Create Table"
      description="Add a new DB table"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="table-name">
        <Label className='text-md text-gray-850'>Table Name</Label>
        <Input
          type="text"
          className="mt-4"
          placeholder="Enter Table Name"
          value={tableName}
          onChange={handleTableNameChange}
        />
      </div>

      <div className='mt-6'>
        <DataCreateTable defData={data} columns={columns} onSubmit={onSubmit} name={tableName} />
      </div>
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={onSubmit}
        >
          Create
        </Button>
      </div>

    </Modal>
  );
};