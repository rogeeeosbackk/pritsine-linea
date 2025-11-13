import { Button } from '@/components/ui/button';
import { Upload, Download, FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRef } from 'react';

export default function VerticalToolbar({ onImportDocx, onExportDocx }) {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportDocx(file);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-10">
      <div className="flex flex-col gap-2 p-2 bg-card border border-border rounded-lg shadow-medium">
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          onChange={handleFileChange}
          className="hidden"
        />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImportClick}
                className="h-12 w-12 p-0 hover:bg-primary/10 transition-smooth"
              >
                <Upload className="h-5 w-5 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Import DOCX</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onExportDocx}
                className="h-12 w-12 p-0 hover:bg-primary/10 transition-smooth"
              >
                <Download className="h-5 w-5 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Export DOCX</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
