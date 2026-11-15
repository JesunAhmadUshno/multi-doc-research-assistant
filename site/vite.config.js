import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/multi-doc-research-assistant/",
  plugins: [react()],
});
