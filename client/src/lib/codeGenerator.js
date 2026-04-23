// Generate HTML/CSS code from components
export function generateHTML(project, pageId, components) {
    const page = project.pages?.find(p => p.id === pageId);
    const pageName = page?.name || 'Page';
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - ${pageName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0f1117;
            color: #f1f5f9;
            line-height: 1.6;
        }
        .canvas {
            position: relative;
            min-height: 100vh;
            width: 100%;
        }
        .component {
            position: absolute;
        }
        /* Component Styles */
        .text-block {
            display: flex;
            align-items: center;
            padding: 12px;
        }
        .btn {
            padding: 8px 20px;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn:hover {
            opacity: 0.9;
            transform: scale(1.05);
        }
        .image-block img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .card {
            background: #1c2028;
            border: 1px solid #2a2f3a;
            border-radius: 12px;
            padding: 16px;
        }
        .card-title {
            font-weight: 600;
            margin-bottom: 6px;
        }
        .card-body {
            font-size: 14px;
            color: #6b7280;
        }
        .hero {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 24px;
            gap: 12px;
        }
        .hero h1 {
            font-size: 32px;
            font-weight: 700;
            margin: 0;
        }
        .hero p {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
        }
        .navbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            border-bottom: 1px solid #2a2f3a;
            background: #1c2028;
        }
        .navbar-brand {
            font-weight: 700;
            color: #388bfd;
        }
        .navbar-links {
            display: flex;
            gap: 16px;
            font-size: 14px;
            color: #6b7280;
        }
        .navbar-links a {
            color: #6b7280;
            text-decoration: none;
            transition: color 0.3s;
        }
        .navbar-links a:hover {
            color: #388bfd;
        }
        .footer {
            background: #1c2028;
            border-top: 1px solid #2a2f3a;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            font-size: 14px;
            padding: 24px;
        }
        .input-field {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #2a2f3a;
            border-radius: 6px;
            background: #1c2028;
            color: #f1f5f9;
            font-family: inherit;
        }
        .input-field:focus {
            outline: none;
            border-color: #388bfd;
            box-shadow: 0 0 0 3px rgba(56, 139, 253, 0.1);
        }
        .dropdown {
            padding: 8px 12px;
            border: 1px solid #2a2f3a;
            border-radius: 6px;
            background: #1c2028;
            color: #f1f5f9;
            font-family: inherit;
            cursor: pointer;
        }
        .container {
            padding: 16px;
        }
        .grid {
            display: grid;
            gap: 16px;
        }
        .grid-2 {
            grid-template-columns: repeat(2, 1fr);
        }
        .grid-3 {
            grid-template-columns: repeat(3, 1fr);
        }
    </style>
</head>
<body>
    <div class="canvas">
`;

    // Add components
    components.forEach(comp => {
        html += generateComponentHTML(comp);
    });

    html += `    </div>
    <script>
        // Navigation function for buttons with links
        function navigateTo(pageId) {
            // In a real app, update page content or navigate
            console.log('Navigate to page:', pageId);
        }
    </script>
</body>
</html>`;

    return html;
}

function generateComponentHTML(component) {
    const { type, x, y, width, height, props = {} } = component;
    const style = `style="position: absolute; left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;"`;

    switch (type) {
        case 'Text':
            return `        <div class="component text-block" ${style} style="color: ${props.color || '#f1f5f9'}; font-size: ${props.fontSize || 16}px;">
            ${props.text || 'Text block'}
        </div>
`;
        case 'Button':
            const target = props.linkTo ? `onclick="navigateTo('${props.linkTo}')"` : '';
            return `        <div class="component" ${style}>
            <button class="btn" style="background: ${props.bg || '#388bfd'}; color: #fff; font-size: ${props.fontSize || 14}px;" ${target}>
                ${props.label || 'Click Me'}
            </button>
        </div>
`;
        case 'Image':
            return `        <div class="component image-block" ${style}>
            <img src="${props.src || 'https://placehold.co/400x200'}" alt="${props.alt || ''}" />
        </div>
`;
        case 'Card':
            return `        <div class="component card" ${style}>
            <div class="card-title" style="color: ${props.titleColor || '#f1f5f9'};">${props.title || 'Card Title'}</div>
            <div class="card-body">${props.body || 'Card description'}</div>
        </div>
`;
        case 'Hero':
            return `        <div class="component hero" ${style} style="background: ${props.bg || 'linear-gradient(135deg,#1c2028,#0f1117)'};">
            <h1 style="color: ${props.titleColor || '#f1f5f9'};">${props.title || 'Hero Title'}</h1>
            <p>${props.subtitle || 'Subtitle'}</p>
            <button class="btn" style="background: #388bfd; color: #fff; margin-top: 8px;">
                ${props.cta || 'Get Started'}
            </button>
        </div>
`;
        case 'Navbar':
            return `        <div class="component navbar" ${style}>
            <span class="navbar-brand">${props.brand || '⚡ Brand'}</span>
            <div class="navbar-links">
                ${(props.links || 'Home, About, Contact').split(',').map(link => `<a href="#">${link.trim()}</a>`).join('\n                ')}
            </div>
        </div>
`;
        case 'Footer':
            return `        <div class="component footer" ${style} style="background: ${props.bg || '#1c2028'};">
            ${props.text || '© 2025 BuildFlow'}
        </div>
`;
        case 'Input':
            return `        <div class="component" ${style}>
            <input type="text" class="input-field" placeholder="${props.placeholder || 'Enter text...'}" />
        </div>
`;
        case 'Dropdown':
            return `        <div class="component" ${style}>
            <select class="dropdown">
                <option>${props.placeholder || 'Select an option'}</option>
                ${(props.options || '').split(',').map(opt => `<option>${opt.trim()}</option>`).join('\n                ')}
            </select>
        </div>
`;
        case 'Container':
            return `        <div class="component container" ${style} style="background: ${props.bg || 'transparent'}; border-radius: ${props.borderRadius || 0}px;">
            ${props.text || 'Container'}
        </div>
`;
        case 'Grid':
            const cols = props.columns || 2;
            return `        <div class="component grid grid-${cols}" ${style}>
            <div style="background: #1c2028; padding: 16px; border-radius: 8px;">Grid Item 1</div>
            <div style="background: #1c2028; padding: 16px; border-radius: 8px;">Grid Item 2</div>
        </div>
`;
        default:
            return '';
    }
}

export function downloadCode(html, filename = 'index.html') {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
