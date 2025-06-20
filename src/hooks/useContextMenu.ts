import { useState } from "react";
import { KonvaEventObject } from "konva/lib/Node";

type ContextMenuType = "postit" | "character" | null;

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  postItIndex: number | null;
  characterIndex: number | null;
  type: ContextMenuType;
}

export function useContextMenu(
  onPostItDelete: (index: number) => Promise<boolean>,
  onCharacterDelete: (index: number) => Promise<boolean>,
  editableIndex: number | null,
  setEditableIndex: (i: number | null) => void,
  setEditingContent: (content: string | null) => void,
  onPostItCreateChild?: (index: number) => void
) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    postItIndex: null,
    characterIndex: null,
    type: null,
  });

  const showContextMenu = (
    e: KonvaEventObject<PointerEvent>,
    index: number,
    type: ContextMenuType
  ) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    setContextMenu({
      visible: true,
      x: pointer.x,
      y: pointer.y,
      postItIndex: type === "postit" ? index : null,
      characterIndex: type === "character" ? index : null,
      type,
    });
  };

  const hideContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      postItIndex: null,
      characterIndex: null,
      type: null,
    });
  };

  const handleDeletePostIt = async () => {
    if (contextMenu.postItIndex !== null) {
      try {
        const success = await onPostItDelete(contextMenu.postItIndex);
        if (success) {
          hideContextMenu();

          if (editableIndex === contextMenu.postItIndex) {
            setEditableIndex(null);
            setEditingContent(null);
          } else if (
            editableIndex !== null &&
            editableIndex > contextMenu.postItIndex
          ) {
            setEditableIndex(editableIndex - 1);
          }
        }
      } catch (error) {
        console.error("Error al eliminar postit:", error);
      }
    }
  };

  const handleDeleteCharacter = async () => {
    if (contextMenu.characterIndex !== null) {
      try {
        const success = await onCharacterDelete(contextMenu.characterIndex);
        if (success) {
          hideContextMenu();
        }
      } catch (error) {
        console.error("Error al eliminar personaje:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (contextMenu.type === "postit") {
      await handleDeletePostIt();
    } else if (contextMenu.type === "character") {
      await handleDeleteCharacter();
    }
  };

  const handleCreateChild = () => {
    if (
      contextMenu.type === "postit" &&
      contextMenu.postItIndex !== null &&
      onPostItCreateChild
    ) {
      onPostItCreateChild(contextMenu.postItIndex);
      hideContextMenu();
    }
  };

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
    handleDelete,
    handleCreateChild,
  };
}
