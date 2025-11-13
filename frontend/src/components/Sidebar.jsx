import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, FileText, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export default function Sidebar({ documents, currentDoc, onSelectDoc, onNewDoc, onDeleteDoc, isOpen, onToggle }) {
  const [deleteDocId, setDeleteDocId] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      <div
        className={cn(
          'border-r border-border bg-card transition-all duration-300 ease-in-out',
          isOpen ? 'w-72' : 'w-0'
        )}
        style={{ boxShadow: isOpen ? 'var(--shadow-soft)' : 'none' }}
      >
        {isOpen && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <Button
                onClick={onNewDoc}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-smooth"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1">
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No documents yet.
                    <br />
                    Create one to get started!
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={cn(
                        'group relative rounded-md p-3 cursor-pointer transition-smooth',
                        currentDoc?.id === doc.id
                          ? 'bg-accent border border-primary/20'
                          : 'hover:bg-accent/50'
                      )}
                    >
                      <div onClick={() => onSelectDoc(doc)} className="pr-8">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-medium text-foreground truncate">
                            {doc.title}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDate(doc.updatedAt)}</span>
                          <span>{doc.wordCount} words</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDocId(doc.id);
                        }}
                        className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-smooth hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                {documents.length} {documents.length === 1 ? 'document' : 'documents'}
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDocId !== null} onOpenChange={() => setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The document will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeleteDoc(deleteDocId);
                setDeleteDocId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
