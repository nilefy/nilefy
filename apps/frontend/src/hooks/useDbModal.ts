import {create} from 'zustand'


interface useDbModalStore{
    isOpen:boolean,
    onOpen:()=>void,
    onClose:()=>void,
};

export const useDbModal = create<useDbModalStore>((set)=>({
    isOpen:false,
    onOpen:()=>set({isOpen:true}),
    onClose:()=>set({isOpen:false})
}))
