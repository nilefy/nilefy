import {
  BaseControlProps,
  InspectorListProps,
} from '@webloom/configpaneltypes';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  MouseSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortableItem } from '@/components/sortableItem';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import * as z from 'zod';
import { useState } from 'react';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Grip, MoreVertical } from 'lucide-react';
import { WebLoomTableColumn } from '@/pages/Editor/Components/WebloomWidgets/Table/index';

const columnsTypes = ['Default', 'String', 'Number', 'Boolean'] as const;
// export type columnsTypes = typeof columnsTypes;
const columnFormSchema = z.object({
  name: z.string(),
  type: z.enum([...columnsTypes]),
  id: z.string(),
  accessorKey: z.string(),
  header: z.string(),
  // default: z.string(),
});

function ColumnDialog({
  columns,
  onChange,
  create,
  initialValues = {
    id: '',
    accessorKey: '',
    header: '',
    name: '',
    type: 'Default',
  },
  open,
  onOpen,
}: {
  columns: WebLoomTableColumn[];
  onChange: (newColumns: WebLoomTableColumn[]) => void;
  create: boolean;
  initialValues?: WebLoomTableColumn;
  open: boolean;
  onOpen: (value: boolean) => void;
}) {
  const { toast } = useToast();
  // form config.
  const form = useForm<z.infer<typeof columnFormSchema>>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      name: initialValues.name ?? '',
      type: initialValues.type ?? 'Default',
      id: initialValues.id ?? '',
      accessorKey: initialValues.accessorKey ?? '',
      header: initialValues.header ?? '',
    },
    shouldUnregister: false, // Do not unregister fields on removal
    mode: 'onSubmit',
  });
  const onSubmit = (data: WebLoomTableColumn) => {
    if (create) {
      const newColumn = {
        id: String(columns.length + 1),
        name: data.name,
        header: data.name,
        accessorKey: data.name.toLowerCase(),
        type: data.type,
      };
      onChange([...columns, newColumn]);
      toast({
        title: 'Column Added Successfully',
      });
    } else {
      const editedColumns = columns.map((col) =>
        col.id === initialValues.id
          ? { ...col, header: data.name, accessorKey: data.name.toLowerCase() }
          : col,
      );
      onChange(editedColumns);
      toast({
        title: 'Column Edited Successfully',
      });
    }
    onOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(e: boolean) => onOpen(e)}>
      <DialogContent>
        <DialogTitle>Column Settings</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-2">
              <FormField
                name="type"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={initialValues.type}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent defaultValue={initialValues.type}>
                        {columnsTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mb-2">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Column Name"
                        defaultValue={initialValues.name}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  form.reset();
                  onOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="ml-2 rounded px-4 py-2  ">
                {create ? 'Add' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const InspectorList = (
  props: InspectorListProps &
    BaseControlProps & { onChange: (newValue: unknown) => void },
) => {
  const [isCreateColumnDialogOpen, setIsCreateColumDialogOpen] =
    useState(false);
  const [isEditColumnDialogOpen, setIsEditColumnDialogOpen] = useState(false);
  const [editableColumn, setEditableColumn] = useState<WebLoomTableColumn>(
    {} as WebLoomTableColumn,
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleColumnClick = (column: WebLoomTableColumn) => {
    setEditableColumn(column);
    setIsEditColumnDialogOpen(true);
  };
  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={props.value || []}
          strategy={verticalListSortingStrategy}
        >
          {props.value?.map((item) => (
            <div
              key={item.id}
              className=" flex h-10 w-full flex-row items-center justify-between rounded-md border-2 border-zinc-700 p-2 "
            >
              <button
                className="w-full"
                onClick={() => handleColumnClick(item)}
              >
                <SortableItem key={item.id} id={item.id}>
                  <Grip size={15} />
                  <p>{item.header}</p>
                </SortableItem>
              </button>
              <div className="basis-1">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="flex flex-col">
                    <DropdownMenuItem onClick={() => handleRemove(item.id)}>
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </SortableContext>
      </DndContext>
      <div className="flex w-full justify-center align-middle ">
        <Button
          className="my-4 w-[90%] py-3 sm:w-5/6"
          onClick={() => setIsCreateColumDialogOpen(true)}
        >
          Add New Column
        </Button>
      </div>
      <ColumnDialog
        columns={props.value ?? []}
        onChange={props.onChange}
        open={isCreateColumnDialogOpen}
        onOpen={(value) => setIsCreateColumDialogOpen(value)}
        create={true}
      />
      {isEditColumnDialogOpen && (
        <ColumnDialog
          columns={props.value ?? []}
          onChange={props.onChange}
          initialValues={editableColumn}
          open={isEditColumnDialogOpen}
          onOpen={(value) => setIsEditColumnDialogOpen(value)}
          create={false}
        />
      )}
    </>
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id && props.value) {
      const oldIndex = props.value.findIndex((item) => item.id === active.id);
      const newIndex = props.value.findIndex((item) => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Update the state with the new order of columns
        props.onChange(arrayMove(props.value, oldIndex, newIndex));
      }
    }
  }

  function handleRemove(id: string) {
    const newCols = props.value?.filter((col) => col.id !== id);
    props.onChange(newCols);
  }
};
export { InspectorList };
