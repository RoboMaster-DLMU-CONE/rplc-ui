import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { configSchema, defaultValues, RplcConfig, cppTypes } from "@/lib/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useEffect } from "react";

interface ConfigFormProps {
  onConfigChange: (config: RplcConfig) => void;
}

export function ConfigForm({ onConfigChange }: ConfigFormProps) {
  const form = useForm<RplcConfig>({
    resolver: zodResolver(configSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  // Watch all fields to update preview
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value) {
        onConfigChange(value as RplcConfig);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onConfigChange]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="packet_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>数据包名称 (Packet Name)</FormLabel>
                    <FormControl>
                      <Input placeholder="SensorData" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="command_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>命令 ID (Command ID)</FormLabel>
                    <FormControl>
                      <Input placeholder="0x0104" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="namespace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>命名空间 (Namespace) - 可选</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Robot::Sensors"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="header_guard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>头文件保护 (Header Guard) - 可选</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="留空自动生成，如: RPL_SENSORDATA_HPP"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormDescription>
                    如果留空，将根据数据包名称自动生成
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">高级设置</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="packed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>紧凑结构 (Packed)</FormLabel>
                    <FormDescription>
                      添加 __attribute__((packed)) 属性
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Fields */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">字段定义</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "new_field", type: "uint8_t", comment: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              添加字段
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3 p-3 border rounded-md bg-muted/20">
                <div className="grid gap-3 flex-1 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name={`fields.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">名称</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`fields.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">类型</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-8 w-full min-w-[120px]">
                              <SelectValue placeholder="选择类型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cppTypes.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`fields.${index}.comment`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">注释</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-8" placeholder="描述" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6 h-8 w-8 text-destructive hover:text-destructive/90"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                暂无字段定义。请点击上方按钮添加。
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
