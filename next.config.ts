import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'y8e.62b.myftpupload.com' },
      { protocol: 'https', hostname: '*.wp.com' },
      { protocol: 'https', hostname: '*.wordpress.com' },
    ],
  },
  async redirects() {
    return [
      // ═══════════════════════════════════════════════════════
      // Old Wix state pages (root level) → new /states/ paths
      // Single-word states (slug matches directly)
      // ═══════════════════════════════════════════════════════
      { source: '/alabama', destination: '/states/alabama', permanent: true },
      { source: '/alaska', destination: '/states/alaska', permanent: true },
      { source: '/arizona', destination: '/states/arizona', permanent: true },
      { source: '/arkansas', destination: '/states/arkansas', permanent: true },
      { source: '/california', destination: '/states/california', permanent: true },
      { source: '/colorado', destination: '/states/colorado', permanent: true },
      { source: '/connecticut', destination: '/states/connecticut', permanent: true },
      { source: '/delaware', destination: '/states/delaware', permanent: true },
      { source: '/florida', destination: '/states/florida', permanent: true },
      { source: '/georgia', destination: '/states/georgia', permanent: true },
      { source: '/hawaii', destination: '/states/hawaii', permanent: true },
      { source: '/idaho', destination: '/states/idaho', permanent: true },
      { source: '/illinois', destination: '/states/illinois', permanent: true },
      { source: '/indiana', destination: '/states/indiana', permanent: true },
      { source: '/iowa', destination: '/states/iowa', permanent: true },
      { source: '/kansas', destination: '/states/kansas', permanent: true },
      { source: '/kentucky', destination: '/states/kentucky', permanent: true },
      { source: '/louisiana', destination: '/states/louisiana', permanent: true },
      { source: '/maine', destination: '/states/maine', permanent: true },
      { source: '/maryland', destination: '/states/maryland', permanent: true },
      { source: '/massachusetts', destination: '/states/massachusetts', permanent: true },
      { source: '/michigan', destination: '/states/michigan', permanent: true },
      { source: '/minnesota', destination: '/states/minnesota', permanent: true },
      { source: '/mississippi', destination: '/states/mississippi', permanent: true },
      { source: '/missouri', destination: '/states/missouri', permanent: true },
      { source: '/montana', destination: '/states/montana', permanent: true },
      { source: '/nebraska', destination: '/states/nebraska', permanent: true },
      { source: '/nevada', destination: '/states/nevada', permanent: true },
      { source: '/ohio', destination: '/states/ohio', permanent: true },
      { source: '/oklahoma', destination: '/states/oklahoma', permanent: true },
      { source: '/oregon', destination: '/states/oregon', permanent: true },
      { source: '/pennsylvania', destination: '/states/pennsylvania', permanent: true },
      { source: '/tennessee', destination: '/states/tennessee', permanent: true },
      { source: '/texas', destination: '/states/texas', permanent: true },
      { source: '/utah', destination: '/states/utah', permanent: true },
      { source: '/vermont', destination: '/states/vermont', permanent: true },
      { source: '/virginia', destination: '/states/virginia', permanent: true },
      { source: '/washington', destination: '/states/washington', permanent: true },
      { source: '/wisconsin', destination: '/states/wisconsin', permanent: true },
      { source: '/wyoming', destination: '/states/wyoming', permanent: true },

      // ═══════════════════════════════════════════════════════
      // Multi-word states (Wix concatenated → Vercel hyphenated)
      // ═══════════════════════════════════════════════════════
      { source: '/newhampshire', destination: '/states/new-hampshire', permanent: true },
      { source: '/newjersey', destination: '/states/new-jersey', permanent: true },
      { source: '/newmexico', destination: '/states/new-mexico', permanent: true },
      { source: '/newyork', destination: '/states/new-york', permanent: true },
      { source: '/northcarolina', destination: '/states/north-carolina', permanent: true },
      { source: '/northdakota', destination: '/states/north-dakota', permanent: true },
      { source: '/rhodeisland', destination: '/states/rhode-island', permanent: true },
      { source: '/southcarolina', destination: '/states/south-carolina', permanent: true },
      { source: '/southdakota', destination: '/states/south-dakota', permanent: true },
      { source: '/westvirginia', destination: '/states/west-virginia', permanent: true },

      // ═══════════════════════════════════════════════════════
      // Territories (Wix had these at root level)
      // ═══════════════════════════════════════════════════════
      { source: '/districtofcolumbia', destination: '/states/district-of-columbia', permanent: true },
      { source: '/puertorico', destination: '/states/puerto-rico', permanent: true },
      { source: '/usvirginislands', destination: '/states/us-virgin-islands', permanent: true },
      { source: '/americansamoa', destination: '/states/american-samoa', permanent: true },
      { source: '/guam', destination: '/states/guam', permanent: true },
      { source: '/northernmarianaislands', destination: '/states/northern-mariana-islands', permanent: true },
      { source: '/unitedstates', destination: '/states', permanent: true },

      // ═══════════════════════════════════════════════════════
      // Miscellaneous old Wix pages
      // ═══════════════════════════════════════════════════════
      { source: '/thankyou', destination: '/', permanent: true },
      { source: '/home-second-version', destination: '/', permanent: true },
      { source: '/courthouses-item-item', destination: '/states', permanent: true },
      { source: '/terms-of-service-1', destination: '/terms-of-service', permanent: true },

      // ═══════════════════════════════════════════════════════
      // Canada province pages (indexed by Google on Wix)
      // Redirect to homepage until Canada pages are built
      // ═══════════════════════════════════════════════════════
      { source: '/canada/:province', destination: '/', permanent: false },

      // ═══════════════════════════════════════════════════════
      // Wix auth/utility pages that exist on Vercel at same path
      // (no redirect needed — but catch any Wix-specific variants)
      // ═══════════════════════════════════════════════════════
      { source: '/login', destination: '/login', permanent: true },
    ];
  },
};

export default nextConfig;
