import { useState } from "react";
import { KonvaEventObject } from "konva/lib/Node";

type ContextMenuType = "postit" | "character" | null;

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  postItId: string | null;
  characterId: string | null;
  type: ContextMenuType;
}

export function useContextMenu(
  onPostItDelete: (id: string) => Promise<boolean>,
  onCharacterDelete: (id: string) => Promise<boolean>,
  setEditableIndex: (i: number | null) => void,
  setEditingContent: (content: string | null) => void,
  onPostItCreateChild?: (id: string) => void,
  onPostItEdit?: (id: string) => void
) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    postItId: null,
    characterId: null,
    type: null,
  });

  const showContextMenu = (
    e: KonvaEventObject<PointerEvent>,
    id: string,
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
      postItId: type === "postit" ? id : null,
      characterId: type === "character" ? id : null,
      type,
    });
  };

  const hideContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      postItId: null,
      characterId: null,
      type: null,
    });
  };

  const handleDeletePostIt = async () => {
    if (contextMenu.postItId !== null) {
      try {
        const success = await onPostItDelete(contextMenu.postItId);
        if (success) {
          hideContextMenu();
          setEditableIndex(null);
          setEditingContent(null);
        }
      } catch (error) {
        console.error("Error al eliminar postit:", error);
      }
    }
  };

  const handleDeleteCharacter = async () => {
    if (contextMenu.characterId !== null) {
      try {
        const success = await onCharacterDelete(contextMenu.characterId);
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
      contextMenu.postItId !== null &&
      onPostItCreateChild
    ) {
      onPostItCreateChild(contextMenu.postItId);
      hideContextMenu();
    }
  };
  const handleEditPostIt = () => {
    if (
        contextMenu.type === "postit" &&
        contextMenu.postItId !== null &&
        onPostItEdit
    ) {
      onPostItEdit(contextMenu.postItId);
      hideContextMenu();
    }
  };

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
    handleDelete,
    handleCreateChild,
    handleEditPostIt
  };
}
