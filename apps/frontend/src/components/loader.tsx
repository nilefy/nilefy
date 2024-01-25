import { Loader } from 'lucide-react';

export function WebloomLoader() {
  return (
    <div className="flex h-full w-full  items-center justify-center ">
      <Loader className="animate-spin " size={30} />
    </div>
  );
}
