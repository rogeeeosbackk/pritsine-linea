import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import FormatToolbar from '@/components/FormatToolbar';

export default function EditorArea({ document: doc, onContentChange, onTitleChange }) {
  const editorRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (doc && editorRef.current && !isUpdatingRef.current) {
      editorRef.current.innerHTML = doc.content;
      updateCounts(doc.content);
    }
  }, [doc?.id]);

  const updateCounts = (html) => {
    const temp = window.document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || '';
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = trimmed.length;
    setWordCount(words);
    setCharCount(chars);
  };

  const handleInput = () => {
    if (!editorRef.current || !doc) return;
    
    isUpdatingRef.current = true;
    const content = editorRef.current.innerHTML;
    updateCounts(content);
    onContentChange(content, wordCount);
    
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
  };

  const execCommand = (command, value = null) => {
    window.document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor-bg">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">No document selected</p>
          <p className="text-sm mt-2">Create a new document to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-editor-bg">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <Input
            value={doc.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-3xl font-bold border-none shadow-none focus-visible:ring-0 px-0 mb-6 bg-transparent font-serif"
            placeholder="Untitled Document"
          />

          <FormatToolbar onCommand={execCommand} />

          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="min-h-[500px] outline-none prose prose-lg max-w-none font-serif text-foreground"
            style={{
              lineHeight: '1.8',
              fontSize: '18px'
            }}
          />
        </div>
      </div>

      <div className="border-t border-border bg-toolbar-bg px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div>
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} {charCount === 1 ? 'character' : 'characters'}
          </div>
          <div>
            Last saved: {new Date(doc.updatedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
