import { useEffect, useState } from 'react';

import { BackgroundBeams } from '@/components/ui/background-beams';
import { ConfigForm } from '@/components/rplc/ConfigForm';
import { Header } from '@/components/rplc/Header';
import { PreviewPanel } from '@/components/rplc/PreviewPanel';
import { ThemeProvider } from '@/components/theme-provider';
import { defaultValues, type RplcConfig } from '@/lib/schema';

const App = () => {
  const [config, setConfig] = useState<RplcConfig>(defaultValues);
  const [wasmInitialized, setWasmInitialized] = useState(false);
  const [wasmFunctions, setWasmFunctions] = useState<{
    check_json?: any;
    compile_cpp?: any;
  }>({});

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
          compile_cpp: wasm.compile_cpp,
        });
        setWasmInitialized(true);
      } catch (error) {
        console.error('Failed to initialize wasm module:', error);
      }
    };

    initWasm();
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="rplc-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased flex flex-col relative">
        <div className="fixed inset-0 z-0">
          <BackgroundBeams />
        </div>
        <Header />
        <main className="flex-1 w-full max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-6 py-6">
            {/* 左侧：配置表单 */}
            <div className="w-full space-y-6">
              <ConfigForm onConfigChange={setConfig} />
            </div>

            {/* 右侧：预览面板 */}
            <div className="w-full">
              <PreviewPanel
                config={config}
                wasmFunctions={wasmFunctions}
                wasmInitialized={wasmInitialized}
              />
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;
