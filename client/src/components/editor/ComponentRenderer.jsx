export default function ComponentRenderer({ component, isSelected }) {
    const { type, props = {} } = component;
    const base = `w-full h-full overflow-hidden ${isSelected ? 'ring-2 ring-accent ring-inset' : ''}`;

    switch (type) {
        case 'Text':
            return (
                <div className={`${base} flex items-center p-3`} style={{ color: props.color || '#f1f5f9', fontSize: props.fontSize || 16 }}>
                    {props.text || 'Text block — edit in the panel →'}
                </div>
            );

        case 'Button':
            return (
                <div className={`${base} flex items-center justify-center`}>
                    <button
                        className="px-5 py-2 rounded-lg font-semibold text-white transition"
                        style={{ backgroundColor: props.bg || '#388bfd', fontSize: props.fontSize || 14 }}
                    >
                        {props.label || 'Click Me'}
                    </button>
                </div>
            );

        case 'Image':
            return (
                <div className={`${base}`}>
                    <img
                        src={props.src || 'https://placehold.co/400x200/1c2028/388bfd?text=Image'}
                        alt={props.alt || 'image'}
                        className="w-full h-full object-cover"
                    />
                </div>
            );

        case 'Card':
            return (
                <div className={`${base} bg-card border border-border rounded-xl p-4 flex flex-col gap-2`}>
                    <div className="font-semibold" style={{ color: props.titleColor || '#f1f5f9' }}>{props.title || 'Card Title'}</div>
                    <div className="text-sm text-muted">{props.body || 'Card description goes here.'}</div>
                </div>
            );

        case 'Hero':
            return (
                <div className={`${base} flex flex-col items-center justify-center text-center p-6 gap-3`}
                    style={{ background: props.bg || 'linear-gradient(135deg,#1c2028,#0f1117)' }}>
                    <h1 className="text-3xl font-bold" style={{ color: props.titleColor || '#f1f5f9' }}>{props.title || 'Hero Title'}</h1>
                    <p className="text-muted text-sm max-w-sm">{props.subtitle || 'A compelling subtitle for your hero section.'}</p>
                    <button className="mt-2 px-6 py-2 bg-accent text-white rounded-lg font-semibold text-sm">
                        {props.cta || 'Get Started'}
                    </button>
                </div>
            );

        case 'Navbar':
            return (
                <div className={`${base} flex items-center justify-between px-6`}
                    style={{ background: props.bg || '#1c2028', borderBottom: '1px solid #2a2f3a' }}>
                    <span className="font-bold text-accent">{props.brand || '⚡ Brand'}</span>
                    <div className="flex gap-4 text-sm text-muted">
                        {(props.links || 'Home, About, Contact').split(',').map((l, i) => (
                            <span key={i} className="hover:text-white cursor-pointer">{l.trim()}</span>
                        ))}
                    </div>
                </div>
            );

        case 'Footer':
            return (
                <div className={`${base} flex items-center justify-center text-muted text-sm`}
                    style={{ background: props.bg || '#1c2028', borderTop: '1px solid #2a2f3a' }}>
                    {props.text || '© 2025 BuildFlow. All rights reserved.'}
                </div>
            );

        case 'Input':
            return (
                <div className={`${base} flex items-center p-3`}>
                    <input
                        type="text"
                        placeholder={props.placeholder || 'Enter text...'}
                        className="bg-surface border border-border rounded px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-accent"
                    />
                </div>
            );

        case 'Dropdown':
            return (
                <div className={`${base} flex items-center p-3`}>
                    <select className="bg-surface border border-border rounded px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-accent">
                        <option>{props.placeholder || 'Select an option'}</option>
                        {(props.options || '').split(',').map((opt, i) => (
                            <option key={i}>{opt.trim()}</option>
                        ))}
                    </select>
                </div>
            );

        case 'Container':
            return (
                <div 
                    className={`${base} flex items-center justify-center p-4`}
                    style={{ 
                        background: props.bg || 'rgba(44,47,59,0.5)', 
                        borderRadius: props.borderRadius ? `${props.borderRadius}px` : 0 
                    }}
                >
                    <span className="text-muted text-sm">{props.text || 'Container'}</span>
                </div>
            );

        case 'Grid':
            const cols = props.columns || 2;
            return (
                <div 
                    className={`${base} p-4`}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        gap: '16px'
                    }}
                >
                    <div className="bg-surface border border-border rounded p-3 text-xs text-muted text-center">Item 1</div>
                    <div className="bg-surface border border-border rounded p-3 text-xs text-muted text-center">Item 2</div>
                    {cols > 2 && <div className="bg-surface border border-border rounded p-3 text-xs text-muted text-center">Item 3</div>}
                </div>
            );

        default:
            return <div className={`${base} flex items-center justify-center text-muted text-sm`}>Unknown: {type}</div>;
    }
}