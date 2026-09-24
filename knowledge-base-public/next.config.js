// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require("@sentry/nextjs");

// En-têtes de sécurité, alignés sur devops/build/front/nginx.conf (vidéos Vimeo seules en iframe)
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  // Directives sans effet sur le rendu : appliquées dès maintenant
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
  // Politique cible (pas de 'unsafe-inline' dans script-src), en observation avant application
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' https://plausible.io",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.snu.gouv.fr https://*.beta-snu.dev https://sentry.incubateur.net https://plausible.io",
      "frame-src https://player.vimeo.com",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const moduleExports = {
  // Your existing module.exports
  optimizeFonts: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    domains: ["snu-bucket-staging.cellar-c2.services.clever-cloud.com"],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/base-de-connaissance",
        permanent: true,
      },
      {
        source: "/help/fr-fr",
        destination: "/base-de-connaissance",
        permanent: true,
      },
      {
        source: "/help",
        destination: "/base-de-connaissance",
        permanent: true,
      },
    ];
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
// hideSourceMaps : les sourcemaps sont envoyées à Sentry sans être servies publiquement
module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions, { hideSourceMaps: true });
