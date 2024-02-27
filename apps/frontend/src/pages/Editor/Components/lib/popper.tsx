import { usePopper } from 'react-popper';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { editorStore } from '@/lib/Editor/Models';
export const Example = () => {
  const [referenceElement, setReferenceElement] = useState();
  const [popperElement, setPopperElement] = useState(null);
  const [arrowElement, setArrowElement] = useState(null);
  const selectedNode = editorStore.currentPage.firstSelectedWidget;
  const instance = usePopper(
    document.querySelector(`[data-id="${selectedNode}"]`),
    document.getElementById('popper'),
    {
      modifiers: [{ name: 'arrow', options: { element: arrowElement } }],
    },
  );
  console.log(instance, 'ssss');

  usePopper(
    document.querySelector(`[data-id="${selectedNode}"]`),
    document.getElementById('popper'),
    {
      modifiers: [{ name: 'arrow', options: { element: arrowElement } }],
    },
  );

  return (
    <>
      {createPortal(
        <div
          id="popper"
          //ref={setPopperElement}
          
        >
          Popper
        </div>,
        document.body,
      )}
    </>
  );
};
