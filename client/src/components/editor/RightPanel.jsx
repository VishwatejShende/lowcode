import { useState } from 'react';
import useStore from '../../store/useStore';
import api from '../../lib/api';

function Field({ label, value, onChange, type = 'text', placeholder }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-muted uppercase tracking-wider">{label}</label>
            <input
                type={type}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="bg-surface border border-border rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-accent"
            />
        </div>
    );
}

function NumberField({ label, value, onChange }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-muted uppercase tracking-wider">{label}</label>
            <input
                type="number"
                value={value ?? ''}
                onChange={(e) => onChange(Number(e.target.value))}
                className="bg-surface border border-border rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-accent"
            />
        </div>
    );
}

function SelectField({ label, value, onChange, options }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-muted uppercase tracking-wider">{label}</label>
            <select
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className="bg-surface border border-border rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-accent"
            >
                <option value="">None</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 6 }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-muted uppercase tracking-wider">{label}</label>
            <textarea
                rows={rows}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="bg-surface border border-border rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-accent resize-y"
            />
        </div>
    );
}

export default function RightPanel() {
    const { currentProject, updateComponent, getSelected } = useStore();
    const selected = getSelected();
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    if (!selected) {
        return (
            <aside className="w-60 bg-card border-l border-border flex flex-col">
                <div className="px-4 py-3 border-b border-border">
                    <span className="text-xs font-semibold text-muted uppercase tracking-widest">Properties</span>
                </div>
                <div className="flex-1 flex items-center justify-center text-muted text-sm p-6 text-center">
                    Select a component to edit its properties
                </div>
            </aside>
        );
    }

    const id = selected._id || selected.id;
    const props = selected.props || {};

    function updateProp(key, val) {
        updateComponent(id, { props: { ...props, [key]: val } });
    }

    function updateLayout(key, val) {
        updateComponent(id, { [key]: val });
    }

    async function handleImageUpload(file) {
        if (!file) return;
        setUploadError('');
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const { data } = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            updateProp('src', data.url);
            if (!props.alt) {
                updateProp('alt', file.name.replace(/\.[^/.]+$/, ''));
            }
        } catch (err) {
            setUploadError(err.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    }

    const pageOptions = currentProject?.pages?.map(p => p.name) || [];

    const renderTypeFields = () => {
        switch (selected.type) {
            case 'Text':
                return (
                    <>
                        <Field label="Text" value={props.text} onChange={(v) => updateProp('text', v)} placeholder="Enter text..." />
                        <Field label="Color" value={props.color} onChange={(v) => updateProp('color', v)} type="color" />
                        <NumberField label="Font Size" value={props.fontSize} onChange={(v) => updateProp('fontSize', v)} />
                    </>
                );
            case 'Button':
                return (
                    <>
                        <Field label="Label" value={props.label} onChange={(v) => updateProp('label', v)} placeholder="Button label" />
                        <Field label="Background" value={props.bg} onChange={(v) => updateProp('bg', v)} type="color" />
                        <NumberField label="Font Size" value={props.fontSize} onChange={(v) => updateProp('fontSize', v)} />
                        <SelectField 
                            label="Link to Page" 
                            value={props.linkTo} 
                            onChange={(v) => updateProp('linkTo', v)} 
                            options={pageOptions}
                        />
                    </>
                );
            case 'Image':
                return (
                    <>
                        <Field label="Image URL" value={props.src} onChange={(v) => updateProp('src', v)} placeholder="https://..." />
                        <Field label="Alt Text" value={props.alt} onChange={(v) => updateProp('alt', v)} placeholder="Alt text" />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted uppercase tracking-wider">Upload Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    handleImageUpload(file);
                                    e.target.value = '';
                                }}
                                className="bg-surface border border-border rounded px-2 py-1.5 text-xs text-white file:mr-2 file:rounded file:border-0 file:bg-accent file:px-2 file:py-1 file:text-white"
                            />
                            {uploading && <span className="text-xs text-muted">Uploading...</span>}
                            {uploadError && <span className="text-xs text-red-400">{uploadError}</span>}
                        </div>
                    </>
                );
            case 'Code':
                return (
                    <>
                        <SelectField
                            label="Language"
                            value={props.language || 'javascript'}
                            onChange={(v) => updateProp('language', v)}
                            options={['javascript', 'typescript', 'html', 'css', 'python', 'json']}
                        />
                        <TextAreaField
                            label="Code"
                            value={props.code}
                            onChange={(v) => updateProp('code', v)}
                            placeholder="// Write your code here"
                            rows={8}
                        />
                    </>
                );
            case 'Card':
                return (
                    <>
                        <Field label="Title" value={props.title} onChange={(v) => updateProp('title', v)} placeholder="Card title" />
                        <Field label="Body" value={props.body} onChange={(v) => updateProp('body', v)} placeholder="Card description" />
                        <Field label="Title Color" value={props.titleColor} onChange={(v) => updateProp('titleColor', v)} type="color" />
                    </>
                );
            case 'Hero':
                return (
                    <>
                        <Field label="Title" value={props.title} onChange={(v) => updateProp('title', v)} placeholder="Hero title" />
                        <Field label="Subtitle" value={props.subtitle} onChange={(v) => updateProp('subtitle', v)} placeholder="Subtitle" />
                        <Field label="CTA Label" value={props.cta} onChange={(v) => updateProp('cta', v)} placeholder="Button label" />
                        <Field label="Title Color" value={props.titleColor} onChange={(v) => updateProp('titleColor', v)} type="color" />
                    </>
                );
            case 'Navbar':
                return (
                    <>
                        <Field label="Brand Name" value={props.brand} onChange={(v) => updateProp('brand', v)} placeholder="Brand" />
                        <Field label="Links (comma-separated)" value={props.links} onChange={(v) => updateProp('links', v)} placeholder="Home, About, Contact" />
                        <Field label="Background" value={props.bg} onChange={(v) => updateProp('bg', v)} type="color" />
                    </>
                );
            case 'Footer':
                return (
                    <>
                        <Field label="Footer Text" value={props.text} onChange={(v) => updateProp('text', v)} placeholder="© 2025 Company" />
                        <Field label="Background" value={props.bg} onChange={(v) => updateProp('bg', v)} type="color" />
                    </>
                );
            case 'Input':
                return (
                    <>
                        <Field label="Placeholder" value={props.placeholder} onChange={(v) => updateProp('placeholder', v)} placeholder="Enter placeholder..." />
                        <Field label="Label" value={props.label} onChange={(v) => updateProp('label', v)} placeholder="Input label" />
                    </>
                );
            case 'Dropdown':
                return (
                    <>
                        <Field label="Placeholder" value={props.placeholder} onChange={(v) => updateProp('placeholder', v)} placeholder="Select option..." />
                        <Field label="Options (comma-separated)" value={props.options} onChange={(v) => updateProp('options', v)} placeholder="Option 1, Option 2, Option 3" />
                    </>
                );
            case 'Container':
                return (
                    <>
                        <Field label="Background" value={props.bg} onChange={(v) => updateProp('bg', v)} type="color" />
                        <NumberField label="Border Radius" value={props.borderRadius} onChange={(v) => updateProp('borderRadius', v)} />
                        <Field label="Text" value={props.text} onChange={(v) => updateProp('text', v)} placeholder="Content" />
                    </>
                );
            case 'Grid':
                return (
                    <>
                        <NumberField label="Columns" value={props.columns} onChange={(v) => updateProp('columns', v)} />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <aside className="w-60 bg-card border-l border-border flex flex-col overflow-y-auto">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-widest">Properties</span>
                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded font-mono">{selected.type}</span>
            </div>

            <div className="flex flex-col gap-4 p-4">
                <div className="text-xs font-semibold text-muted uppercase tracking-wider pb-1 border-b border-border">Layout</div>
                <div className="grid grid-cols-2 gap-2">
                    <NumberField label="X" value={selected.x} onChange={(v) => updateLayout('x', v)} />
                    <NumberField label="Y" value={selected.y} onChange={(v) => updateLayout('y', v)} />
                    <NumberField label="Width" value={selected.width} onChange={(v) => updateLayout('width', v)} />
                    <NumberField label="Height" value={selected.height} onChange={(v) => updateLayout('height', v)} />
                </div>

                <div className="text-xs font-semibold text-muted uppercase tracking-wider pb-1 border-b border-border mt-2">Content</div>
                {renderTypeFields()}
            </div>
        </aside>
    );
}