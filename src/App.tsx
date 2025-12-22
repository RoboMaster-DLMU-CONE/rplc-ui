import { useState, useEffect } from 'react';
import { Header } from '@/components/rplc/Header';
import { ConfigForm } from '@/components/rplc/ConfigForm';
import { defaultValues, RplcConfig } from '@/lib/schema';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CodeHighlight } from '@/components/ui/code-highlight';

const App = () => {
  const [config, setConfig] = useState<RplcConfig>(defaultValues);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [wasmInitialized, setWasmInitialized] = useState(false);

  // 初始化 wasm 模块
  useEffect(() => {
    const initWasm = async () => {
      try {
        // 首先导入模块
        const wasm = await import('@robomaster-cone/rplc-wasm');
        // 然后初始化 WASM
        await wasm.default();
        // 保存函数引用
        setWasmFunctions({
          check_json: wasm.check_json,
          compile_cpp: wasm.compile_cpp
        });
        setWasmInitialized(true);
      } catch (error) {
        console.error('Failed to initialize wasm module:', error);
      }
    };

    initWasm();
  }, []);

  // 保存导入的 WASM 函数
  const [wasmFunctions, setWasmFunctions] = useState<{ check_json?: any; compile_cpp?: any }>({});

  const handleGenerate = async () => {
    if (!wasmInitialized || !wasmFunctions.check_json || !wasmFunctions.compile_cpp) {
      setDiagnostics([{ severity: 'Error', message: 'WASM 模块尚未初始化完成，请稍后再试。' }]);
      setIsModalOpen(true);
      return;
    }

    setIsGenerating(true);

    try {
      // 将配置转换为 JSON 字符串
      const jsonString = JSON.stringify(config);

      // 使用 wasm 进行验证
      const diagnosticsResult = wasmFunctions.check_json(jsonString);
      setDiagnostics(diagnosticsResult);

      // 检查是否有错误
      const hasErrors = diagnosticsResult.some((diag: any) => diag.severity === 'Error');

      if (!hasErrors) {
        // 如果没有错误，生成 C++ 代码
        const cppCode = wasmFunctions.compile_cpp(jsonString);
        setGeneratedCode(cppCode);
      }

      // 打开模态框显示结果
      setIsModalOpen(true);
    } catch (error) {
      console.error('生成过程中出现错误:', error);
      setDiagnostics([{ severity: 'Error', message: `生成失败: ${error instanceof Error ? error.message : '未知错误'}` }]);
      setIsModalOpen(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedCode) return;

    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.packet_name}.hpp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <ThemeProvider defaultTheme="system" storageKey="rplc-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
          <ConfigForm onConfigChange={setConfig} />

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-2"
            >
              {isGenerating ? '生成中...' : '生成'}
            </Button>
          </div>
        </main>

        {/* 结果模态框 */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>生成结果</DialogTitle>
              <DialogDescription>
                以下是根据您的配置生成的结果
              </DialogDescription>
            </DialogHeader>

            <div className="flex-grow overflow-auto">
              {/* 显示错误信息 */}
              {diagnostics.filter(diag => diag.severity === 'Error').length > 0 && (
                <div className="mb-4">
                  <h3 className="text-red-600 font-semibold mb-2">错误信息：</h3>
                  <ul className="text-red-500 list-disc pl-5 space-y-1">
                    {diagnostics
                      .filter(diag => diag.severity === 'Error')
                      .map((diag, index) => (
                        <li key={`error-${index}`}>{diag.message}</li>
                      ))
                    }
                  </ul>
                </div>
              )}

              {/* 显示警告信息 */}
              {diagnostics.filter(diag => diag.severity === 'Warning').length > 0 && (
                <Accordion type="single" collapsible className="mb-4">
                  <AccordionItem value="warnings">
                    <AccordionTrigger>警告信息 ({diagnostics.filter(diag => diag.severity === 'Warning').length})</AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-yellow-600 list-disc pl-5 space-y-1">
                        {diagnostics
                          .filter(diag => diag.severity === 'Warning')
                          .map((diag, index) => (
                            <li key={`warning-${index}`}>{diag.message}</li>
                          ))
                        }
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* 只有在没有错误时才显示生成的代码 */}
              {generatedCode && diagnostics.filter(diag => diag.severity === 'Error').length === 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">生成的 C++ 头文件：</h3>
                  <div className="border rounded-md overflow-hidden">
                    <CodeHighlight code={generatedCode} lang="cpp" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <div className="text-sm text-gray-500">
                <a
                  href="https://github.com/robomaster-cone/rplc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  使用说明
                </a>
              </div>

              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  关闭
                </Button>
                {generatedCode && (
                  <Button onClick={handleDownload}>
                    下载
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  );
};

export default App;
