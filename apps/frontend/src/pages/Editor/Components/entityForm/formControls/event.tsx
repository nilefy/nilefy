import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

function InspectorEventManger() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>onClick</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <p>Event</p>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onClick">onClick</SelectItem>
              <SelectItem value="hover">Hover</SelectItem>
            </SelectContent>
          </Select>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <p>Action</p>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="controlComponent">
                Control Component
              </SelectItem>
            </SelectContent>
          </Select>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Action Options</DropdownMenuLabel>
        <DropdownMenuItem>
          <p>Component</p>
          {/* <Select
            value={selectedComponent}
            onValueChange={(e) => {
              setSelectedComponent(e);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(tree)
                .filter((node) => node.id !== EDITOR_CONSTANTS.ROOT_NODE_ID)
                .map((node) => (
                  <SelectItem value={node.id} key={node.id}>
                    {node.id}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select> */}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <p>Action</p>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="setText">Set Text</SelectItem>
            </SelectContent>
          </Select>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Text <Input />
        </DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default InspectorEventManger;
