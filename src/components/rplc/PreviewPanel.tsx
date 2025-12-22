import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CodeHighlight } from "@/components/ui/code-highlight";
import { RplcConfig } from "@/lib/schema";

interface PreviewPanelProps {
  config: RplcConfig;
}

export function PreviewPanel({ config }: PreviewPanelProps) {
  // Generate sample C++ code based on the configuration
  const generateCppCode = (): string => {
    return `#ifndef ${config.packet_name.toUpperCase()}_H
#define ${config.packet_name.toUpperCase()}_H

#include <stdint.h>

struct ${config.packet_name} {
  // Generated from configuration
  uint32_t timestamp_ms{0};

  // Add fields based on your configuration schema
  // This is a simplified example - extend based on actual needs
};

#endif // ${config.packet_name.toUpperCase()}_H`;
  };

  const jsonContent = JSON.stringify(config, null, 2);
  const cppContent = generateCppCode();

  return (
    <div className="h-full flex flex-col gap-4">
      <Card className="flex-1 flex flex-col overflow-hidden py-0 gap-0">
        <CardContent className="p-0 flex-1 overflow-hidden">
          <Tabs defaultValue="cpp" className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
              <span className="text-sm font-medium">实时预览</span>
              <TabsList className="h-8">
                <TabsTrigger value="json" className="text-xs h-7">JSON 配置</TabsTrigger>
                <TabsTrigger value="cpp" className="text-xs h-7">C++ 头文件</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="json" className="flex-1 p-0 m-0 relative">
              <ScrollArea className="h-full">
                <CodeHighlight code={jsonContent} lang="json" />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="cpp" className="flex-1 p-0 m-0 relative">
              <ScrollArea className="h-full">
                <CodeHighlight code={cppContent} lang="cpp" />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
