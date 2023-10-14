import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Children, useEffect, useMemo, useRef } from 'react';

type DraggableProps = {
    children: Record<string,boolean>;
   id:Record<string,boolean>
   
};
export const ElementEditorAdapter = (props: DraggableProps) => {
   console.log(Object.keys(props.id)[0])

    return (
        <div
           
            className="z-50 relative bg-gray-200 float-left h-full w-1/5 text-center" 
           
        >
            <p>{Object.keys(props.id)[0]}</p>
        </div>
    );
};

export default ElementEditorAdapter;
