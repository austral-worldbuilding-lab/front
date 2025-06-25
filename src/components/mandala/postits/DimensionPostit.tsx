import React, { useState, useRef, useEffect } from "react";
import { Postit } from "@/types/mandala";
import MandalaMenu from "../MandalaMenu";
import { isDarkColor } from "@/utils/colorUtils";

interface EditablePostitCardProps {
    postit: Postit;
    color: string;
    onUpdate: (updates: Partial<Postit>) => Promise<boolean>;
    onDelete: () => Promise<boolean>;
    width?: number;
    height?: number;
    padding?: number;
}

const DimensionPostit: React.FC<EditablePostitCardProps> = ({
       postit,
       color,
       onUpdate,
       onDelete,
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

    const textColor = isDarkColor(color) ? "white" : "black";

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


    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowMenu(true);
    };

    const handleDelete = async () => {
        await onDelete();
        setShowMenu(false);
    };

    return (
        <>
            <div
                className="relative text-sm whitespace-pre-line break-words overflow-hidden rounded-full"
                style={{
                    backgroundColor: color,
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onDoubleClick={handleDoubleClick}
                onContextMenu={handleContextMenu}
            >
                {isEditing ? (
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        ref={(el) => {
                            if (el && isEditing) {
                                el.focus();
                                const range = document.createRange();
                                const sel = window.getSelection();
                                range.selectNodeContents(el);
                                range.collapse(false);
                                sel?.removeAllRanges();
                                sel?.addRange(range);
                            }
                        }}
                        onBlur={(e) => {
                            setIsEditing(false);
                            const newText = e.currentTarget.innerText;
                            if (newText !== postit.content) {
                                setEditingContent(newText);
                                setDisplayContent(newText);
                                onUpdate({content: newText});
                            }
                        }}
                        onInput={(e) => setEditingContent((e.target as HTMLElement).innerText)}
                        style={{
                            width,
                            height,
                            backgroundColor: color,
                            color: textColor,
                            fontSize: 11,
                            lineHeight: 1.1,
                            fontFamily: "inherit",
                            borderRadius: "50%",
                            boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                            boxSizing: "border-box",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 8,
                            outline: "none",
                            whiteSpace: "pre-wrap",
                            overflow: "hidden",
                            userSelect: "text",
                            cursor: "text",
                        }}
                    >
                        {editingContent}
                    </div>

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
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                        }}
                    >
                        {displayContent}
                    </div>
                )}
            </div>

            {showMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}/>
                    <div
                        className="fixed z-50"
                        style={{left: menuPosition.x, top: menuPosition.y}}
                    >
                    <MandalaMenu onDelete={handleDelete} isContextMenu />
                    </div>
                </>
            )}
        </>
    );
};

export default DimensionPostit;
