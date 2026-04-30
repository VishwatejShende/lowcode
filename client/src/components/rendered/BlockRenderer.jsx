export default function BlockRenderer({ component, onNavigate }) {
    const { type, x, y, width, height, props = {}, children = [] } = component;

    const style = { position: 'absolute', left: x, top: y, width, height, overflow: 'hidden' };
    let body = null;

    switch (type) {
        case 'Text':
            body = (
                <div style={{ color: props.color || '#f1f5f9', fontSize: props.fontSize || 16, padding: 12, display: 'flex', alignItems: 'center' }}>
                    {props.text || 'Text block'}
                </div>
            );
            break;
        case 'Button':
            body = (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <button
                        onClick={() => {
                            if (props.linkTo && onNavigate) onNavigate(props.linkTo);
                        }}
                        style={{ background: props.bg || '#388bfd', color: '#fff', padding: '8px 20px', borderRadius: 8, fontWeight: 600, fontSize: props.fontSize || 14, border: 'none', cursor: 'pointer' }}
                    >
                        {props.label || 'Click Me'}
                    </button>
                </div>
            );
            break;
        case 'Image':
            body = <img src={props.src || 'https://placehold.co/400x200'} alt={props.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
            break;
        case 'Code':
            body = (
                <div style={{ background: '#0d1117', border: '1px solid #2a2f3a', borderRadius: 8, padding: 12, width: '100%', height: '100%', overflow: 'auto' }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: 8 }}>
                        {props.language || 'javascript'}
                    </div>
                    <pre style={{ margin: 0, fontSize: 12, color: '#e5e7eb', whiteSpace: 'pre-wrap' }}>
                        <code>{props.code || '// Write your code here'}</code>
                    </pre>
                </div>
            );
            break;
        case 'Card':
            body = (
                <div style={{ background: '#1c2028', border: '1px solid #2a2f3a', borderRadius: 12, padding: 16, width: '100%', height: '100%' }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, color: props.titleColor || '#f1f5f9' }}>{props.title || 'Card Title'}</div>
                    <div style={{ fontSize: 14, color: '#6b7280' }}>{props.body || 'Card description'}</div>
                </div>
            );
            break;
        case 'Hero':
            body = (
                <div style={{ background: props.bg || 'linear-gradient(135deg,#1c2028,#0f1117)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, gap: 12, width: '100%', height: '100%' }}>
                    <h1 style={{ fontSize: 32, fontWeight: 700, color: props.titleColor || '#f1f5f9', margin: 0 }}>{props.title || 'Hero Title'}</h1>
                    <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>{props.subtitle || 'Subtitle'}</p>
                    <button style={{ marginTop: 8, background: '#388bfd', color: '#fff', padding: '8px 24px', borderRadius: 8, fontWeight: 600, border: 'none', cursor: 'pointer' }}>{props.cta || 'Get Started'}</button>
                </div>
            );
            break;
        case 'Navbar':
            body = (
                <div style={{ background: props.bg || '#1c2028', borderBottom: '1px solid #2a2f3a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', width: '100%', height: '100%' }}>
                    <span style={{ fontWeight: 700, color: '#388bfd' }}>{props.brand || '⚡ Brand'}</span>
                    <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#6b7280' }}>
                        {(props.links || 'Home, About, Contact').split(',').map((l, i) => <span key={i}>{l.trim()}</span>)}
                    </div>
                </div>
            );
            break;
        case 'Footer':
            body = (
                <div style={{ background: props.bg || '#1c2028', borderTop: '1px solid #2a2f3a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 14, width: '100%', height: '100%' }}>
                    {props.text || '© 2025 BuildFlow'}
                </div>
            );
            break;
        case 'Input':
            body = (
                <div style={{ display: 'flex', alignItems: 'center', padding: 12, width: '100%', height: '100%' }}>
                    <input 
                        type="text" 
                        placeholder={props.placeholder || 'Enter text...'} 
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #2a2f3a', borderRadius: 6, background: '#1c2028', color: '#f1f5f9', fontFamily: 'inherit' }}
                    />
                </div>
            );
            break;
        case 'Dropdown':
            body = (
                <div style={{ display: 'flex', alignItems: 'center', padding: 12, width: '100%', height: '100%' }}>
                    <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #2a2f3a', borderRadius: 6, background: '#1c2028', color: '#f1f5f9', fontFamily: 'inherit', cursor: 'pointer' }}>
                        <option>{props.placeholder || 'Select an option'}</option>
                        {(props.options || '').split(',').map((opt, i) => <option key={i}>{opt.trim()}</option>)}
                    </select>
                </div>
            );
            break;
        case 'Container':
            body = (
                <div style={{ background: props.bg || 'rgba(44,47,59,0.5)', borderRadius: props.borderRadius ? `${props.borderRadius}px` : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, width: '100%', height: '100%' }}>
                    <span style={{ color: '#6b7280', fontSize: 14 }}>{props.text || 'Container'}</span>
                </div>
            );
            break;
        case 'Grid':
            body = (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${props.columns || 2}, 1fr)`, gap: 16, padding: 16, width: '100%', height: '100%' }}>
                    <div style={{ background: '#1c2028', border: '1px solid #2a2f3a', borderRadius: 8, padding: 16, textAlign: 'center', color: '#6b7280', fontSize: 12 }}>Item 1</div>
                    <div style={{ background: '#1c2028', border: '1px solid #2a2f3a', borderRadius: 8, padding: 16, textAlign: 'center', color: '#6b7280', fontSize: 12 }}>Item 2</div>
                    {(props.columns || 2) > 2 && <div style={{ background: '#1c2028', border: '1px solid #2a2f3a', borderRadius: 8, padding: 16, textAlign: 'center', color: '#6b7280', fontSize: 12 }}>Item 3</div>}
                </div>
            );
            break;
        default:
            return null;
    }

    return (
        <div style={style}>
            {body}
            {children.map((child) => {
                const childId = child._id || child.id;
                return <BlockRenderer key={childId} component={child} onNavigate={onNavigate} />;
            })}
        </div>
    );
}