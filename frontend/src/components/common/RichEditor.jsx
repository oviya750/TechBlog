import React, { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  Code,
  Quote,
  Table,
  Video,
  Eye,
  Edit3
} from 'lucide-react';

const RichEditor = ({ value = '', onChange }) => {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef(null);

  const insertSnippet = (before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || placeholder;

    const replacement = `${before}${selectedText}${after}`;
    const newValue =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 50);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter destination URL (https://...):', 'https://');
    if (url) {
      insertSnippet(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, '</a>', 'Link text');
    }
  };

  const handleInsertImage = () => {
    const url = prompt('Enter Image URL:', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80');
    if (url) {
      const alt = prompt('Enter Image Alt Text:', 'Technology Diagram') || 'Image';
      insertSnippet(`\n<figure class="article-media">\n  <img src="${url}" alt="${alt}" />\n  <figcaption>${alt}</figcaption>\n</figure>\n`);
    }
  };

  const handleInsertVideo = () => {
    const embedUrl = prompt('Enter YouTube or Vimeo Embed URL (e.g. https://www.youtube.com/embed/...):', 'https://www.youtube.com/embed/dQw4w9WgXcQ');
    if (embedUrl) {
      insertSnippet(`\n<div class="video-embed-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0;border-radius:12px;">\n  <iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe>\n</div>\n`);
    }
  };

  const handleInsertTable = () => {
    const tableTemplate = `
<table>
  <thead>
    <tr>
      <th>Architecture Layer</th>
      <th>Specification</th>
      <th>Throughput Latency</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Edge Proxy</td>
      <td>HTTP/3 & TLS 1.3</td>
      <td>&lt; 5ms</td>
    </tr>
    <tr>
      <td>Application Gateway</td>
      <td>Node.js Cluster</td>
      <td>12ms</td>
    </tr>
  </tbody>
</table>
`;
    insertSnippet(tableTemplate);
  };

  return (
    <div style={{
      border: '1.5px solid rgba(7, 63, 50, 0.15)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'var(--color-white)'
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4px',
        padding: '0.6rem 0.8rem',
        background: 'var(--color-ivory-light)',
        borderBottom: '1px solid rgba(7, 63, 50, 0.1)'
      }}>
        <button
          type="button"
          onClick={() => insertSnippet('<strong>', '</strong>', 'bold text')}
          title="Bold"
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => insertSnippet('<em>', '</em>', 'italic text')}
          title="Italic"
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <Italic size={16} />
        </button>

        <div style={{ width: '1px', height: '20px', background: 'rgba(7, 63, 50, 0.15)', margin: '0 4px' }} />

        <button
          type="button"
          onClick={() => insertSnippet('\n<h2 id="' + Date.now() + '">', '</h2>\n', 'Section Heading')}
          title="Heading 2"
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <Heading2 size={16} />
        </button>

        <button
          type="button"
          onClick={() => insertSnippet('\n<h3 id="' + Date.now() + '">', '</h3>\n', 'Subsection Heading')}
          title="Heading 3"
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <Heading3 size={16} />
        </button>

        <div style={{ width: '1px', height: '20px', background: 'rgba(7, 63, 50, 0.15)', margin: '0 4px' }} />

        <button
          type="button"
          onClick={() => insertSnippet('\n<ul>\n  <li>', '</li>\n  <li>Second item</li>\n</ul>\n', 'First item')}
          title="Bullet List"
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => insertSnippet('\n<ol>\n  <li>', '</li>\n  <li>Second step</li>\n</ol>\n', 'First step')}
          title="Numbered List"
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <ListOrdered size={16} />
        </button>

        <button
          type="button"
          onClick={() => insertSnippet('\n<blockquote>\n  "', '"\n</blockquote>\n', 'Key editorial insight or quote')}
          title="Blockquote"
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <Quote size={16} />
        </button>

        <button
          type="button"
          onClick={() => insertSnippet('\n<pre><code class="language-javascript">\n', '\n</code></pre>\n', '// Paste code snippet here')}
          title="Code Block"
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <Code size={16} />
        </button>

        <button
          type="button"
          onClick={handleInsertLink}
          title="Insert Hyperlink"
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <LinkIcon size={16} />
        </button>

        <button
          type="button"
          onClick={handleInsertImage}
          title="Insert Image"
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <Image size={16} />
        </button>

        <button
          type="button"
          onClick={handleInsertVideo}
          title="Embed Video"
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <Video size={16} />
        </button>

        <button
          type="button"
          onClick={handleInsertTable}
          title="Insert Table"
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <Table size={16} />
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`btn btn-sm ${isPreview ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: 'var(--text-xs)' }}
          >
            {isPreview ? (
              <>
                <Edit3 size={14} /> Back to Editor
              </>
            ) : (
              <>
                <Eye size={14} /> Live Preview
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {isPreview ? (
        <div
          className="article-prose"
          style={{
            padding: '1.5rem',
            minHeight: '380px',
            background: 'var(--color-white)',
            overflowY: 'auto'
          }}
          dangerouslySetInnerHTML={{ __html: value || '<p style="color:var(--color-text-light)">Nothing to preview yet. Switch to edit mode to write article content.</p>' }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write rich editorial article content using HTML formatting or toolbar actions..."
          rows={16}
          style={{
            width: '100%',
            padding: '1.25rem',
            border: 'none',
            outline: 'none',
            fontSize: '1rem',
            fontFamily: 'var(--font-code)',
            lineHeight: 1.6,
            resize: 'vertical',
            color: 'var(--color-text-main)',
            backgroundColor: 'transparent'
          }}
        />
      )}
    </div>
  );
};

export default RichEditor;

