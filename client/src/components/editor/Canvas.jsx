import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { useState } from 'react';
import useStore from '../../store/useStore';
import ComponentRenderer from './ComponentRenderer';

function DraggableComponent({ component, isSelected, onSelect, onDelete }) {
    const id = component._id || component.id;
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id,
        data: { fromCanvas: true, component },
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                position: 'absolute',
                left: component.x,
                top: component.y,
                width: component.width,
                height: component.height,
                opacity: isDragging ? 0.4 : 1,
                zIndex: isSelected ? 10 : 1,
            }}
            onClick={(e) => { e.stopPropagation(); onSelect(id); }}
            className="group"
        >
            {/* Drag handle */}
            <div
                {...listeners}
                {...attributes}
                className="absolute -top-5 left-0 hidden group-hover:flex items-center gap-1 bg-accent text-white text-xs px-2 py-0.5 rounded-t cursor-grab z-20"
            >
                ⠿ {component.type}
                <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                    className="ml-2 hover:text-red-300"
                >✕</button>
            </div>

            <ComponentRenderer component={component} isSelected={isSelected} />
        </div>
    );
}

export default function Canvas() {
    const { components, selectedId, setSelectedId, removeComponent } = useStore();

    const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

    return (
        <div
            ref={setNodeRef}
            className={`relative flex-1 overflow-auto bg-bg ${isOver ? 'canvas-drop-active' : ''}`}
            style={{ minHeight: '100%', minWidth: 800 }}
            onClick={() => setSelectedId(null)}
        >
            {/* Grid background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #2a2f3a 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            {components.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted gap-2 pointer-events-none">
                    <div className="text-5xl opacity-30">🧩</div>
                    <div className="text-sm opacity-50">Drag components from the left sidebar</div>
                </div>
            )}

            {components.map((c) => {
                const id = c._id || c.id;
                return (
                    <DraggableComponent
                        key={id}
                        component={c}
                        isSelected={selectedId === id}
                        onSelect={setSelectedId}
                        onDelete={removeComponent}
                    />
                );
            })}
        </div>
    );
}