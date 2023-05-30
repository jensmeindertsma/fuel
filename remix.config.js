/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  cacheDirectory: "./node_modules/.cache/remix",
  serverBuildPath: "./build/app/index.js",
  serverModuleFormat: "esm",
  serverPlatform: "node",
  future: {
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
    unstable_dev: true,
  },
};
