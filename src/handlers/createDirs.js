import { mkdir } from "fs/promises";

const directories = ["./temp", "./cache"];

for (const dir of directories) {
  const result = await mkdir(dir, { recursive: true });
  if (result) console.log("Directorio creado:", result);
}
