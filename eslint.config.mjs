import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // React Three Fiber frame loops mutate Three.js objects (camera, textures, meshes) every
    // frame by design; the React Compiler immutability/ref rules don't model imperative 3D code.
    files: ["src/components/three/**"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
  // Installed agent skills ship their own scripts; they are not part of the site.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".claude/**", ".agents/**", ".taste-skill/**"]),
]);
