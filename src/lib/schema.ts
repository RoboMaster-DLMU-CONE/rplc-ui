import { z } from "zod";

// C++ Identifier Regex
const cppIdentifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const fieldSchema = z.object({
  name: z.string()
    .min(1, "名称不能为空")
    .regex(cppIdentifierRegex, "必须是有效的 C++ 标识符"),
  type: z.string().min(1, "类型不能为空"),
  comment: z.string().optional(),
});

export const configSchema = z.object({
  packet_name: z.string()
    .min(1, "数据包名称不能为空")
    .regex(cppIdentifierRegex, "必须是有效的 C++ 标识符"),
  command_id: z.string()
    .min(1, "命令 ID 不能为空")
    .refine((val) => {
      const num = val.toLowerCase().startsWith("0x") 
        ? parseInt(val, 16) 
        : parseInt(val, 10);
      return !isNaN(num) && num >= 0 && num <= 65535;
    }, "必须是有效的 uint16 (0-65535)"),
  namespace: z.string().optional().nullable(),
  packed: z.boolean().default(true),
  header_guard: z.string().optional().nullable(),
  fields: z.array(fieldSchema).min(1, "至少需要一个字段"),
});

export type RplcConfig = z.infer<typeof configSchema>;
export type RplcField = z.infer<typeof fieldSchema>;

export const defaultValues: RplcConfig = {
  packet_name: "SensorData",
  command_id: "0x0104",
  namespace: null,
  packed: true,
  header_guard: null,
  fields: [
    {
      name: "sensor_id",
      type: "uint8_t",
      comment: "Sensor ID",
    },
  ],
};

export const cppTypes = [
  "uint8_t", "int8_t", 
  "uint16_t", "int16_t", 
  "uint32_t", "int32_t", 
  "uint64_t", "int64_t", 
  "float", "double", "int"
];
