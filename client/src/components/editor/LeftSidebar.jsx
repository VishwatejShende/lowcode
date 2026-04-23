import { useDraggable } from '@dnd-kit/core';

const COMPONENT_TYPES = [
    { type: 'Navbar', icon: '📌', desc: 'Navigation bar' },
    { type: 'Hero', icon: '🦸', desc: 'Hero section' },
    { type: 'Text', icon: '📝', desc: 'Text block' },
    { type: 'Button', icon: '🔘', desc: 'Clickable button' },
    { type: 'Image', icon: '🖼️', desc: 'Image block' },
    { type: 'Card', icon: '🃏', desc: 'Content card' },
    { type: 'Input', icon: '⌨️', desc: 'Text input field' },
    { type: 'Dropdown', icon: '▼', desc: 'Select dropdown' },
    { type: 'Container', icon: '📦', desc: 'Container box' },
    { type: 'Grid', icon: '⊞', desc: 'Grid layout' },
    { type: 'Footer', icon: '📎', desc: 'Footer section' },
];

function DraggableTile({ type, icon, desc }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-${type}`,
        data: { fromSidebar: true, type },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface border border-border cursor-grab active:cursor-grabbing hover:border-accent transition select-none ${isDragging ? 'opacity-40' : ''}`}
        >
            <span className="text-xl">{icon}</span>
            <div>
                <div className="text-sm font-medium">{type}</div>
                <div className="text-xs text-muted">{desc}</div>
            </div>
        </div>
    );
}

export default function LeftSidebar() {
    return (
        <aside className="w-56 bg-card border-r border-border flex flex-col overflow-y-auto">
            <div className="px-4 py-3 border-b border-border">
                <span className="text-xs font-semibold text-muted uppercase tracking-widest">Components</span>
            </div>
            <div className="flex flex-col gap-2 p-3">
                {COMPONENT_TYPES.map((c) => (
                    <DraggableTile key={c.type} {...c} />
                ))}
            </div>
        </aside>
    );
}