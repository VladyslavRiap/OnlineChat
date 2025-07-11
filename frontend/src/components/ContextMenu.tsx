import { Pencil, Trash2 } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
}

export const ContextMenu = ({ x, y, onEdit, onDelete }: ContextMenuProps) => {
  return (
    <div
      className="fixed bg-white shadow-lg rounded-md py-2 z-50 hidden md:block"
      style={{ top: `${y}px`, left: `${x}px` }}
    >
      <button
        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-sm"
        onClick={onEdit}
      >
        <Pencil size={16} className="text-blue-500" />
        <span>Edit</span>
      </button>
      <button
        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-sm"
        onClick={onDelete}
      >
        <Trash2 size={16} className="text-red-500" />
        <span>Delete</span>
      </button>
    </div>
  );
};
