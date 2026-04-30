import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import useStore from '../../store/useStore';
import ComponentRenderer from './ComponentRenderer';

const COMPONENT_USAGE = {
    Navbar: 'Top navigation with brand and links',
    Hero: 'Main attention section with headline',
    Text: 'Plain text content',
    Button: 'Trigger actions or navigate pages',
    Image: 'Display images or media',
    Code: 'Show or write code snippets',
    Card: 'Group content in a styled box',
    Input: 'Capture text from users',
    Dropdown: 'Select one option from list',
    Container: 'Wrap and group nested elements',
    Grid: 'Arrange items in columns',
    Footer: 'Bottom information section',
};

function DraggableComponent({ component, selectedComponentId, onSelect, onDelete }) {
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
                zIndex: selectedComponentId === id ? 10 : 1,
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
            <div className="absolute top-1 right-1 hidden group-hover:block bg-black/70 text-[10px] text-slate-200 px-2 py-1 rounded z-20 max-w-48">
                {COMPONENT_USAGE[component.type] || 'Reusable UI building block'}
            </div>

            <ComponentRenderer component={component} isSelected={selectedComponentId === id} />
            {(component.children || []).map((child) => {
                const childId = child._id || child.id;
                return (
                    <DraggableComponent
                        key={childId}
                        component={child}
                        selectedComponentId={selectedComponentId}
                        onSelect={onSelect}
                        onDelete={onDelete}
                    />
                );
            })}
        </div>
    );
}

export default function Canvas() {
    const { components, selectedComponentId, setSelectedComponentId, removeComponent, currentProject, currentPageId } = useStore();

    const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });
    const currentPage = currentProject?.pages?.find((p) => p.id === currentPageId);
    const backgroundMedia = currentPage?.backgroundMedia || '';

    return (
        <div
            ref={setNodeRef}
            className={`relative flex-1 overflow-auto bg-bg ${isOver ? 'canvas-drop-active' : ''}`}
            style={{
                minHeight: '100%',
                minWidth: 800,
                backgroundColor: currentPage?.backgroundColor || '#0f1117',
                backgroundImage: backgroundMedia ? `url("${backgroundMedia}")` : undefined,
                backgroundSize: backgroundMedia ? 'cover' : undefined,
                backgroundPosition: backgroundMedia ? 'center' : undefined,
                backgroundRepeat: backgroundMedia ? 'no-repeat' : undefined,
            }}
            onClick={() => setSelectedComponentId(null)}
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
                        selectedComponentId={selectedComponentId}
                        onSelect={setSelectedComponentId}
                        onDelete={removeComponent}
                    />
                );
            })}
        </div>
    );
}