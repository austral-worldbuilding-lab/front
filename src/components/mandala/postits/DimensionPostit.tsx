import React, { useState, useRef, useEffect } from "react";
import { Postit } from "@/types/mandala";
import MandalaMenu from "../MandalaMenu";
import { isDarkColor } from "@/utils/colorUtils";

interface EditablePostitCardProps {
    postit: Postit;
    color?: string;
    onUpdate: (updates: Partial<Postit>) => Promise<boolean>;
    onDelete: () => Promise<boolean>;
    onCreateChild?: () => void;
    onEdit?: () => void;
    width?: number;
    height?: number;
    padding?: number;
}

const DimensionPostit: React.FC<EditablePostitCardProps> = ({
       postit,
       color,
       onUpdate,
       onDelete,
       onCreateChild,
       onEdit,
       width = 80,
       height = 80,
       padding = 8,
    }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingContent, setEditingContent] = useState(postit.content);
    const [displayContent, setDisplayContent] = useState(postit.content);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const fixedColor = color ?? "#facc15";
    const textColor = isDarkColor(fixedColor) ? "white" : "black";

    useEffect(() => {
        if (isEditing && textAreaRef.current) {
            textAreaRef.current.focus();
            const len = textAreaRef.current.value.length;
            textAreaRef.current.setSelectionRange(len, len);
        }
    }, [isEditing]);


    useEffect(() => {
        setEditingContent(postit.content);
        setDisplayContent(postit.content);
    }, [postit.content]);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = async () => {
        setIsEditing(false);
        if (editingContent !== postit.content) {
            setDisplayContent(editingContent);
            await onUpdate({ content: editingContent });
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowMenu(true);
    };

    const handleDelete = async () => {
        await onDelete();
        setShowMenu(false);
    };

    const handleCreateChild = () => {
        if (onCreateChild) {
            onCreateChild();
            setShowMenu(false);
        }
    };
    const handleEdit = () => {
        if (onEdit) {
            onEdit();
            setShowMenu(false);
        }
    };


    return (
        <>
            <div
                className="relative text-sm whitespace-pre-line break-words overflow-hidden rounded-[4px]"
                style={{
                    backgroundColor: fixedColor,
                    color: textColor,
                    width,
                    height,
                    padding: 0,
                    boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                    boxSizing: "border-box",
                    userSelect: isEditing ? "text" : "none",
                    cursor: isEditing ? "text" : "pointer",
                    outline: isEditing ? "1px solid #ccc" : "none",
                    outlineOffset: "-2px",
                }}
                onDoubleClick={handleDoubleClick}
                onContextMenu={handleContextMenu}
            >
                {isEditing ? (
                    <textarea
                        ref={textAreaRef}
                        className="resize-none outline-none"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        onBlur={handleBlur}
                        style={{
                            width: width,
                            height: height,
                            padding: padding,
                            backgroundColor: fixedColor,
                            color: textColor,
                            boxSizing: "border-box",
                            fontSize: 11,
                            lineHeight: 1.1,
                            fontFamily: "inherit",
                            borderRadius: 4,
                            border: "none",
                            boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                            overflow: "hidden",
                            resize: "none",
                            whiteSpace: "pre-wrap",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            whiteSpace: "pre-line",
                            wordBreak: "break-word",
                            fontSize: 11,
                            lineHeight: 1.1,
                            userSelect: "none",
                            padding: padding,
                            height: "100%",
                            boxSizing: "border-box",
                        }}
                    >
                        {displayContent}
                    </div>
                )}
            </div>

            {showMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div
                        className="fixed z-50"
                        style={{ left: menuPosition.x, top: menuPosition.y }}
                    >
                        <MandalaMenu
                            onDelete={handleDelete}
                            onCreateChild={handleCreateChild}
                            onEdit={handleEdit}
                            isContextMenu />
                    </div>
                </>
            )}
        </>
    );
};

export default DimensionPostit;