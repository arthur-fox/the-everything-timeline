/**
 * Day 52: tip jar ("☕ Support"). The ONLY place these values live — the panel, the QR codes
 * (generated at build time by scripts/build-data.mjs) and scripts/check-support.js all read
 * this file. check-support.js fails the build if any value changes, so an edit here must be
 * deliberate (update the expected strings there too, after Arthur verifies them).
 */
export const SUPPORT_CONFIG = {
  KOFI_URL: 'https://ko-fi.com/affox',
  CRYPTO: [
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      network: 'Bitcoin network',
      address: 'bc1q7g20llyazt34ys7gue965gamwzrgwg2wg3cr79',
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      network: 'Ethereum and EVM chains',
      note: 'Works on Ethereum and EVM chains (e.g. Base, Arbitrum, Optimism, Polygon); same address.',
      address: '0x7bE8c264c9DCebA3A35990c78d5C4220D8724B6e',
    },
    {
      id: 'sol',
      name: 'Solana',
      symbol: 'SOL',
      network: 'Solana network',
      address: '6HaHdCrev3uHWQEinavVD23puCRt81c2XA2Kbmo6vbmX',
    },
  ],
};
