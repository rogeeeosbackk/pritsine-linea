import { useState, useEffect, useRef } from 'react';
import Toolbar from '@/components/Toolbar';
import EditorArea from '@/components/EditorArea';
import Sidebar from '@/components/Sidebar';
import VerticalToolbar from '@/components/VerticalToolbar';
import { toast } from 'sonner';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export default function Editor() {
  const [documents, setDocuments] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const saveTimeoutRef = useRef(null);

  // Load documents from localStorage on mount
  useEffect(() => {
    const savedDocs = localStorage.getItem('documents');
    if (savedDocs) {
      const parsed = JSON.parse(savedDocs);
      setDocuments(parsed);
      if (parsed.length > 0) {
        setCurrentDoc(parsed[0]);
      }
    } else {
      // Create a welcome document
      const welcomeDoc = {
        id: Date.now(),
        title: 'Welcome to WriteFlow',
        content: '<h1>Welcome to WriteFlow</h1><p>A minimal, beautiful writing experience.</p><p><br></p><p>Start typing to create your masterpiece...</p>',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wordCount: 12
      };
      setDocuments([welcomeDoc]);
      setCurrentDoc(welcomeDoc);
      localStorage.setItem('documents', JSON.stringify([welcomeDoc]));
    }
  }, []);

  // Auto-save document changes
  const handleContentChange = (content, wordCount) => {
    if (!currentDoc) return;

    const updatedDoc = {
      ...currentDoc,
      content,
      wordCount,
      updatedAt: new Date().toISOString()
    };

    setCurrentDoc(updatedDoc);

    // Debounce save to localStorage
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const updatedDocs = documents.map(doc => 
        doc.id === updatedDoc.id ? updatedDoc : doc
      );
      setDocuments(updatedDocs);
      localStorage.setItem('documents', JSON.stringify(updatedDocs));
    }, 500);
  };

  const handleTitleChange = (title) => {
    if (!currentDoc) return;

    const updatedDoc = {
      ...currentDoc,
      title,
      updatedAt: new Date().toISOString()
    };

    setCurrentDoc(updatedDoc);

    const updatedDocs = documents.map(doc => 
      doc.id === updatedDoc.id ? updatedDoc : doc
    );
    setDocuments(updatedDocs);
    localStorage.setItem('documents', JSON.stringify(updatedDocs));
  };

  const createNewDocument = () => {
    const newDoc = {
      id: Date.now(),
      title: 'Untitled Document',
      content: '<p><br></p>',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: 0
    };

    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    setCurrentDoc(newDoc);
    localStorage.setItem('documents', JSON.stringify(updatedDocs));
    toast.success('New document created');
  };

  const deleteDocument = (docId) => {
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocs);
    localStorage.setItem('documents', JSON.stringify(updatedDocs));

    if (currentDoc?.id === docId) {
      setCurrentDoc(updatedDocs[0] || null);
    }

    toast.success('Document deleted');
  };

  const exportDocument = (format) => {
    if (!currentDoc) return;

    const element = window.document.createElement('a');
    let content = '';
    let fileType = '';

    if (format === 'txt') {
      // Strip HTML tags for plain text
      const temp = window.document.createElement('div');
      temp.innerHTML = currentDoc.content;
      content = temp.textContent || temp.innerText;
      fileType = 'text/plain';
    } else if (format === 'html') {
      content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${currentDoc.title}</title>
  <style>
    body { font-family: 'Merriweather', Georgia, serif; max-width: 650px; margin: 40px auto; padding: 0 20px; line-height: 1.8; color: #333; }
    h1 { font-size: 2em; margin-bottom: 0.5em; }
    h2 { font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.5em; }
    p { margin-bottom: 1em; }
  </style>
</head>
<body>
  ${currentDoc.content}
</body>
</html>`;
      fileType = 'text/html';
    }

    const file = new Blob([content], { type: fileType });
    element.href = URL.createObjectURL(file);
    element.download = `${currentDoc.title}.${format}`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);

    toast.success(`Document exported as ${format.toUpperCase()}`);
  };

  // Import DOCX file
  const handleImportDocx = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      const fileName = file.name.replace('.docx', '');
      const newDoc = {
        id: Date.now(),
        title: fileName,
        content: result.value || '<p><br></p>',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wordCount: 0
      };

      // Calculate word count
      const temp = window.document.createElement('div');
      temp.innerHTML = result.value;
      const text = temp.textContent || temp.innerText || '';
      const trimmed = text.trim();
      newDoc.wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

      const updatedDocs = [newDoc, ...documents];
      setDocuments(updatedDocs);
      setCurrentDoc(newDoc);
      localStorage.setItem('documents', JSON.stringify(updatedDocs));
      
      toast.success(`Imported: ${fileName}`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import DOCX file');
    }
  };

  // Export current document as DOCX
  const handleExportDocx = async () => {
    if (!currentDoc) {
      toast.error('No document to export');
      return;
    }

    try {
      // Parse HTML content
      const temp = window.document.createElement('div');
      temp.innerHTML = currentDoc.content;
      
      const children = [];
      
      // Convert HTML elements to docx paragraphs
      const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.trim();
          if (text) {
            return new TextRun({
              text: text,
              bold: node.parentElement?.tagName === 'STRONG' || node.parentElement?.tagName === 'B',
              italics: node.parentElement?.tagName === 'EM' || node.parentElement?.tagName === 'I',
              underline: node.parentElement?.tagName === 'U' ? {} : undefined
            });
          }
          return null;
        }
        return null;
      };

      const processElement = (element) => {
        const tagName = element.tagName;
        
        if (tagName === 'H1') {
          children.push(
            new Paragraph({
              text: element.textContent,
              heading: HeadingLevel.HEADING_1
            })
          );
        } else if (tagName === 'H2') {
          children.push(
            new Paragraph({
              text: element.textContent,
              heading: HeadingLevel.HEADING_2
            })
          );
        } else if (tagName === 'P') {
          const textRuns = [];
          const childNodes = element.childNodes;
          
          childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
              const text = child.textContent;
              if (text.trim()) {
                textRuns.push(new TextRun({ text }));
              }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const childTag = child.tagName;
              const text = child.textContent;
              
              if (text.trim()) {
                textRuns.push(
                  new TextRun({
                    text,
                    bold: childTag === 'STRONG' || childTag === 'B',
                    italics: childTag === 'EM' || childTag === 'I',
                    underline: childTag === 'U' ? {} : undefined
                  })
                );
              }
            }
          });
          
          if (textRuns.length > 0) {
            children.push(new Paragraph({ children: textRuns }));
          } else {
            children.push(new Paragraph({ text: '' }));
          }
        } else if (tagName === 'UL' || tagName === 'OL') {
          const items = element.querySelectorAll('li');
          items.forEach(item => {
            children.push(
              new Paragraph({
                text: item.textContent,
                bullet: tagName === 'UL' ? { level: 0 } : undefined,
                numbering: tagName === 'OL' ? { reference: 'default-numbering', level: 0 } : undefined
              })
            );
          });
        } else if (tagName === 'BLOCKQUOTE') {
          children.push(
            new Paragraph({
              text: element.textContent,
              italics: true,
              indent: { left: 720 }
            })
          );
        } else if (tagName === 'BR') {
          children.push(new Paragraph({ text: '' }));
        }
      };

      // Process all child nodes
      Array.from(temp.children).forEach(element => {
        processElement(element);
      });

      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children.length > 0 ? children : [new Paragraph({ text: '' })]
          }
        ]
      });

      

      // Generate and save
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${currentDoc.title}.docx`);
      
      toast.success('Document exported as DOCX');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export DOCX file');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        documents={documents}
        currentDoc={currentDoc}
        onSelectDoc={setCurrentDoc}
        onNewDoc={createNewDocument}
        onDeleteDoc={deleteDocument}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Toolbar
          onExport={exportDocument}
          onNewDoc={createNewDocument}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        
        <EditorArea
          document={currentDoc}
          onContentChange={handleContentChange}
          onTitleChange={handleTitleChange}
        />
      </div>

      <VerticalToolbar
        onImportDocx={handleImportDocx}
        onExportDocx={handleExportDocx}
      />
    </div>
  );
}
