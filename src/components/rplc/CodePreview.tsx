import { Download, Loader2 } from 'lucide-react';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeHighlight } from '@/components/ui/code-highlight';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface CodePreviewProps {
  code: string;
  hasErrors: boolean;
  isLoading?: boolean;
  wasmInitialized: boolean;
  packetName: string;
}

export function CodePreview({
  code,
  hasErrors,
  isLoading,
  wasmInitialized,
  packetName,
}: CodePreviewProps) {
  const handleDownload = () => {
    if (!code) return;

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${packetName}.hpp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="flex-1 flex flex-col border-border/50 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              C++ 代码预览
            </CardTitle>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {code && !hasErrors && (
            <RainbowButton variant="outline" onClick={handleDownload}>
              <Download />
              下载
            </RainbowButton>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-0">
        <ScrollArea className="h-full">
          {!wasmInitialized || isLoading ? (
            <div className="space-y-3 rounded-md border border-border/60 bg-muted/30 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : code && !hasErrors ? (
            <div className="rounded-md border border-border/60 overflow-hidden bg-muted/30 shadow-inner">
              <CodeHighlight code={code} lang="cpp" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border border-dashed border-border/50 rounded-md bg-muted/20 transition-colors">
              {hasErrors ? '请修复错误后查看代码' : '等待生成代码...'}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
