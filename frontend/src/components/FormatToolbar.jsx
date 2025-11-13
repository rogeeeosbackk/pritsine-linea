import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FormatToolbar({ onCommand }) {
  const formatButtons = [
    {
      icon: Bold,
      command: 'bold',
      label: 'Bold (Ctrl+B)'
    },
    {
      icon: Italic,
      command: 'italic',
      label: 'Italic (Ctrl+I)'
    },
    {
      icon: Underline,
      command: 'underline',
      label: 'Underline (Ctrl+U)'
    },
    { separator: true },
    {
      icon: Heading1,
      command: 'formatBlock',
      value: '<h1>',
      label: 'Heading 1'
    },
    {
      icon: Heading2,
      command: 'formatBlock',
      value: '<h2>',
      label: 'Heading 2'
    },
    { separator: true },
    {
      icon: List,
      command: 'insertUnorderedList',
      label: 'Bullet List'
    },
    {
      icon: ListOrdered,
      command: 'insertOrderedList',
      label: 'Numbered List'
    },
    { separator: true },
    {
      icon: Quote,
      command: 'formatBlock',
      value: '<blockquote>',
      label: 'Quote'
    }
  ];

  return (
    <div className="flex items-center gap-1 mb-6 p-2 rounded-lg bg-accent/30 border border-border w-fit">
      {formatButtons.map((btn, idx) => {
        if (btn.separator) {
          return <Separator key={idx} orientation="vertical" className="h-6 mx-1" />;
        }

        const Icon = btn.icon;
        return (
          <Button
            key={idx}
            variant="ghost"
            size="sm"
            onClick={() => onCommand(btn.command, btn.value)}
            className="h-8 w-8 p-0 hover:bg-primary/10 transition-smooth"
            title={btn.label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
}
