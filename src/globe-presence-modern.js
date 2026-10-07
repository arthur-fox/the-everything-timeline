/**
 * Day 36 — Presence fills the modern globe (review feedback C).
 *
 * Arthur: "the globe should be completely full today, only not in sparsely populated areas like
 * deserts, the tundra, poles, and large rainforests". Two changes:
 *
 * 1. Hearths hand off instead of vanishing. Every regional presence hearth now holds its last
 *    footprint until the modern inhabited-world layer covers that region (1700 or 1880), so
 *    Presence never empties between antiquity and the modern era.
 * 2. `global-modern-presence` ("Inhabited world") grows 1700 → 1850 → 1900 → 2025 to cover
 *    nearly all habitable land as ~50 separate continental / island regions, deliberately leaving
 *    sparse: the Sahara, Arabian and Australian interiors, the Gobi / Taklamakan / Tibetan
 *    plateau core, Siberian and Canadian tundra / northern taiga, Greenland, Antarctica, and the
 *    core Amazon, Congo and Borneo rainforests (Kalahari / Namib and Atacama too).
 *
 * Still schematic / honest: presence means "people live here", not density; rings are hand-drawn,
 * never GIS, and islands stay separate regions (no ocean-spanning rings).
 */

const R = (id, name, ring, holes) => (holes ? { id, name, ring, holes } : { id, name, ring });

// --- Europe ---
const IBERIA = [[-9.5, 36.5], [-9.3, 43.5], [-1.5, 43.5], [3.2, 42.3], [0, 38.5], [-2, 36.7], [-5.5, 36], [-9.5, 36.5]];
const W_CENTRAL_EUROPE = [[-4.5, 48.5], [-1.5, 43.5], [3.2, 42.5], [7.5, 43.7], [12.5, 44], [14, 45.5], [19, 47.5], [24, 48], [24, 54.5], [14, 54.2], [8.5, 55.2], [4.5, 52.8], [1.6, 51], [-4.5, 48.5]];
const ITALY = [[7.5, 44], [12.5, 44.2], [18.5, 40.3], [16, 38], [15.6, 40], [12, 41.8], [10, 43.8], [7.5, 44]];
const GREAT_BRITAIN = [[-5.7, 50], [-3, 53.4], [-5, 54.8], [-6, 57], [-5, 58.6], [-3, 58.6], [-2, 57], [-1.5, 55.5], [0.3, 53.4], [1.7, 52.6], [1.3, 51.1], [-5.7, 50]];
const IRELAND = [[-10, 51.6], [-10, 54.3], [-8, 55.3], [-6, 54.7], [-6, 52.1], [-10, 51.6]];
const S_SCANDINAVIA = [[5, 58], [6, 63], [13, 64], [18.5, 62.5], [18.8, 59.5], [16.5, 56.2], [13, 55.4], [11, 56], [8, 57.5], [5, 58]];
const S_FINLAND = [[21, 60], [22, 63], [27, 63.5], [30, 61.6], [28, 60.4], [23, 59.9], [21, 60]];
const DENMARK = [[8, 54.9], [8.1, 57.1], [10.6, 57.7], [12.6, 55.6], [11, 54.6], [8, 54.9]];
const BALKANS = [[13.5, 45.5], [19, 47.5], [28, 48], [29.7, 45.2], [28, 41.5], [26, 40.8], [24, 40], [22.5, 37], [21, 38.5], [19.5, 41.5], [13.5, 45.5]];
const E_EUROPE = [[24, 48], [24, 57], [28, 59.5], [30, 61.5], [40, 62], [50, 60.5], [60, 59], [61, 54], [55, 50], [47, 46], [40, 44], [37, 46.8], [33, 45.5], [30, 46], [29.7, 45.5], [28, 48], [24, 48]];
const ANATOLIA_CAUCASUS = [[26, 36.5], [26, 42], [36, 42], [41.5, 41.5], [47, 42], [50, 40.5], [48.5, 38.5], [44.5, 37], [40, 37], [36, 36], [30, 36.2], [26, 36.5]];

// --- Middle East / North Africa (Sahara + Arabian interior left sparse) ---
const LEVANT_MESOPOTAMIA = [[34.2, 31], [35.8, 36.5], [40, 37.2], [44.5, 37.2], [46, 35], [48.5, 30], [47.5, 29.5], [44, 31], [40, 33], [36.5, 32], [35, 29.5], [34.2, 31]];
const IRAN = [[44.5, 37], [48, 38.8], [53.5, 37.3], [57, 38.2], [61, 36.5], [61, 31], [57.5, 27], [51.5, 27.8], [48.5, 30.2], [46, 33], [44.5, 37]];
const ARABIA_WEST = [[35, 28], [36.5, 28], [39.5, 22], [42.5, 17], [44, 16], [52, 17], [53, 15.5], [49, 14], [44, 12.6], [42.6, 13.8], [39, 20], [35, 28]];
const ARABIA_GULF = [[45, 24.5], [46.5, 26.5], [50, 27.5], [51.5, 25.5], [54, 24.2], [56, 26], [57.5, 23.5], [59.8, 22.5], [57, 20.5], [55.5, 22.5], [51, 24], [47, 23.5], [45, 24.5]];
const NILE_EGYPT = [[29.5, 22], [29.8, 31.2], [32.5, 31.3], [32.5, 25], [33, 22], [29.5, 22]];
const NILE_SUDAN = [[30, 15], [32, 22], [33.6, 22], [33.5, 15.5], [32.5, 12.5], [30, 15]];
const MAGHREB = [[-10, 29], [-9.8, 32], [-6.5, 35.8], [-2, 35.2], [3, 36.8], [10.2, 37.3], [11.1, 35.2], [10.2, 33.5], [8, 33.5], [3, 34], [-2, 32], [-6, 30], [-10, 29]];
const LIBYA_COAST = [[11, 32.2], [15, 32.6], [20, 32.9], [25, 31.8], [24.5, 30.8], [20, 31], [15, 31.2], [11, 32.2]];

// --- Sub-Saharan Africa (core Congo rainforest + Kalahari / Namib left sparse) ---
const SAHEL_WEST_AFRICA = [[-17.5, 14.5], [-16.5, 16.5], [-12, 15.5], [-5, 15], [0, 14.8], [4, 14], [9, 13.5], [14, 12.5], [15, 10], [12, 6.5], [9.5, 4], [5, 4.5], [-1, 4.8], [-8, 4.3], [-13.5, 7.5], [-17.5, 14.5]];
const SUDAN_HORN = [[23, 12], [32, 13.5], [36.5, 15.5], [39.5, 15], [43, 11.5], [45, 10], [51, 11.5], [48, 5], [42, -1], [37.5, 3], [34, 4], [29, 4.5], [25, 7], [23, 12]];
const CENTRAL_AFRICA_N = [[9.5, 4], [12, 6.5], [15, 10], [22, 10], [26, 7], [29, 4.5], [30.5, 2.5], [27, 3.5], [22, 4.5], [18, 3.5], [15, 3], [11, 2], [9.5, 4]];
const EAST_AFRICA = [[29.5, -1], [30, 2.5], [34, 4.5], [37.5, 3.5], [42, -1], [40.5, -6], [40.5, -10.5], [35, -11.5], [30, -8.5], [29.5, -1]];
const CENTRAL_AFRICA_S = [[12, -5], [13.5, -12], [12, -17], [17, -17.5], [23, -17.5], [27, -17], [33, -17], [35.5, -24], [40.5, -15], [40.5, -10.5], [35, -11.5], [30, -8.5], [29.5, -3], [27, -4], [22, -3.5], [17, -3], [12, -5]];
const SOUTHERN_AFRICA = [[18, -34.5], [18.5, -31], [20, -28.5], [24, -26], [26, -22.5], [28, -21], [32, -22], [33, -25.5], [32.8, -28], [30, -31.5], [26, -34], [20, -34.8], [18, -34.5]];
const MADAGASCAR = [[43.5, -24], [44, -17], [47, -13], [50.4, -15.5], [47.5, -25], [45, -25.5], [43.5, -24]];

// --- South & East Asia (Thar is populated; Tibet core, Gobi, Taklamakan left sparse) ---
const SOUTH_ASIA = [[66.5, 25], [67, 30], [71, 34.5], [74.5, 35], [78, 32], [81, 30], [88, 27.5], [92, 27], [95, 27.5], [94, 24], [92.5, 22], [90, 22], [86.5, 20.5], [84, 18], [80.3, 15.5], [80.2, 13], [79.8, 10.3], [77.5, 8], [76, 9.5], [74.8, 13], [73, 17.5], [72.6, 21], [69, 22.5], [66.5, 25]];
const SRI_LANKA = [[79.8, 6.2], [79.9, 9.8], [81, 8.8], [81.9, 7.2], [81.2, 6], [80.2, 5.9], [79.8, 6.2]];
const CHINA_EAST = [[98, 23], [99, 28], [102, 31], [103, 35], [104, 37], [108, 40], [112, 41], [118, 41.5], [122, 40.5], [121, 38], [119, 37], [122.5, 37], [121.8, 32.2], [122.2, 30.8], [122, 30], [120, 26], [117, 23.5], [113, 22], [110, 21], [108, 21.5], [105, 22.8], [101, 21.5], [98, 23]];
const MANCHURIA_KOREA = [[120, 41], [121, 46], [124, 48.5], [128, 49.5], [131, 47.5], [134, 48], [131, 43], [130, 42.4], [129.7, 40.8], [128.4, 38.6], [129.5, 36.8], [129.4, 35.2], [127.5, 34.6], [126.3, 34.5], [126.5, 36.5], [126.6, 37.7], [125, 38.3], [124.3, 40], [122, 40.2], [120, 41]];
const JAPAN_MAIN = [[129.8, 31.5], [130, 33.8], [131.5, 34.5], [133, 35.6], [136, 36], [137.5, 37.5], [140, 40.5], [141.5, 41.3], [142, 39], [141, 37], [140.8, 35.5], [139.5, 34.8], [137, 34.5], [135, 33.5], [132.5, 32.8], [131.2, 31.3], [129.8, 31.5]];
const HOKKAIDO = [[140, 41.5], [140.2, 43.3], [141.8, 45.4], [145.5, 43.4], [143.5, 42], [141, 41.6], [140, 41.5]];
const TAIWAN = [[120.1, 22.4], [120.2, 25.1], [121.9, 25.2], [121.6, 23.4], [120.8, 21.9], [120.1, 22.4]];

// --- Central / North Asia (tundra + northern taiga left sparse) ---
const CENTRAL_ASIA = [[52, 41], [54, 45], [60, 47], [66, 50], [73, 51.5], [80, 51], [83, 50.5], [80, 45], [80, 42.5], [75, 40], [71, 37], [67, 37], [62, 36], [56, 38], [52, 41]];
const SIBERIA_WEST = [[60, 54], [61, 59], [75, 58], [88, 57.5], [96, 57], [96, 51.5], [90, 50.5], [83, 50.5], [73, 51.5], [66, 54], [60, 54]];
const SIBERIA_EAST = [[96, 51.5], [96, 57], [105, 56], [110, 55.5], [120, 53.5], [128, 53], [135, 50], [134, 48], [131, 47.5], [128, 49.5], [120, 50], [110, 50.5], [100, 51], [96, 51.5]];

// --- Southeast Asia & Oceania (Borneo interior, Australian interior left sparse) ---
const SE_ASIA_MAINLAND = [[92.2, 21], [94, 25], [98, 27.5], [101, 21.5], [105, 22.8], [108, 21.5], [106.5, 19], [109, 15], [109.3, 11.5], [106.7, 9], [104.8, 8.7], [105, 10.3], [102.5, 12], [100, 13.5], [99.2, 9.5], [100.5, 6.5], [103.5, 1.5], [101, 2.8], [98.5, 8], [97.5, 16], [94.5, 17], [92.2, 21]];
const SUMATRA = [[95, 5.6], [97.5, 5.2], [100.5, 2], [104, -1], [106, -3], [106, -5.9], [104.5, -5.9], [102, -4], [98.5, -0.5], [95, 5.6]];
const JAVA = [[105.2, -6.8], [106, -5.9], [108.5, -6.3], [111, -6.4], [114.5, -7.7], [114.4, -8.7], [111, -8.3], [108, -7.8], [105.2, -6.8]];
const BORNEO_SW = [[109, 1.8], [110.5, 2], [111, 0], [113, -1.5], [116, -1.5], [116.4, -3.8], [114.5, -3.5], [111, -3], [109.6, -1], [109, 1.8]];
const BORNEO_N = [[110.5, 1.6], [113.5, 4.4], [116, 6.9], [118.5, 5.2], [117.5, 4.2], [114, 2.7], [111, 1.5], [110.5, 1.6]];
const LUZON = [[119.8, 16], [120.6, 18.6], [122.2, 18.5], [122, 16], [124, 13], [123, 12.6], [120.6, 13.8], [119.8, 16]];
const VISAYAS_MINDANAO = [[121.9, 11.8], [123, 7.2], [122, 6.9], [124.5, 6], [126.5, 7], [126, 9.8], [125.2, 11.3], [124, 12.6], [121.9, 11.8]];
const NEW_GUINEA = [[141, -5.5], [143, -5], [145.5, -6], [147.5, -8.5], [146, -9.2], [143, -8.3], [141, -6.8], [141, -5.5]];
const AUSTRALIA_EAST = [[138, -34.8], [141, -38.3], [146, -39.1], [150, -37.5], [153.5, -28], [153, -25], [150.5, -22], [146.5, -19], [145.5, -15.5], [144, -14.5], [145, -17.5], [147, -21], [148, -25], [147, -29], [144, -33], [140, -33.5], [138, -34.8]];
const AUSTRALIA_SW = [[114.8, -34.5], [115.7, -31], [115, -29], [117.5, -30.5], [118.5, -34], [117.5, -35.1], [115, -34.8], [114.8, -34.5]];
const AUSTRALIA_TOP_END = [[129.5, -15], [130, -12.2], [133, -11.5], [136.8, -12.2], [135.5, -15], [132, -15.6], [129.5, -15]];
const NZ_NORTH = [[172.6, -34.4], [174.5, -36], [176, -37.7], [178.5, -37.7], [177, -39.4], [175.3, -41.6], [174.6, -41.3], [174.8, -39.8], [173.8, -39.2], [174.5, -37.5], [172.6, -34.4]];
const NZ_SOUTH = [[166.5, -46], [168.5, -46.8], [171, -45.9], [173, -43.8], [174.3, -41.7], [172.7, -40.5], [171.5, -41.8], [170.2, -43.2], [168, -44.3], [166.5, -46]];
const HAWAII = [[-160.3, 21.9], [-159.3, 22.3], [-156, 21], [-154.8, 19.5], [-155.9, 18.9], [-157, 20.5], [-160.3, 21.9]];
const FIJI = [[177, -18.3], [177.5, -17.3], [178.8, -16.4], [179.9, -16.2], [179.9, -17.2], [178.4, -18.3], [177, -18.3]];

// --- North America (Canadian north, Alaska interior, Greenland left sparse) ---
const US_EAST = [[-97, 26], [-97.5, 30], [-98, 36], [-100, 40], [-100, 46], [-97, 49], [-90, 48.3], [-84, 46.5], [-82.5, 45.3], [-79, 43.3], [-75, 45], [-71.5, 45], [-67, 47], [-67, 44.5], [-70, 41.5], [-74, 40.2], [-76, 37], [-75.5, 35.3], [-78, 33.8], [-81.2, 31.5], [-80.1, 26.5], [-80.5, 25.2], [-82, 26.5], [-83, 29.5], [-85.5, 29.8], [-89.5, 30.2], [-94, 29.5], [-97, 26]];
const CANADA_SOUTH = [[-123.5, 49], [-123, 51], [-114, 53.7], [-106, 53.8], [-97.5, 51], [-92, 49.5], [-86, 49], [-80, 47.5], [-75, 47], [-71, 47.6], [-65.5, 48.8], [-64, 46], [-66.5, 45], [-71.5, 45.1], [-75, 45], [-79.5, 43.2], [-83, 45.8], [-88.5, 48.3], [-95, 49], [-123.5, 49]];
const US_PACIFIC = [[-124.4, 40], [-124.7, 48.4], [-122, 49], [-117, 49], [-117, 46], [-120.5, 45.5], [-121.5, 42], [-120, 38.5], [-118, 35.5], [-116, 34], [-114.8, 32.6], [-117.1, 32.5], [-118.5, 34], [-120.6, 34.5], [-122.5, 37.5], [-124.4, 40]];
const US_INTERIOR_WEST = [[-117, 49], [-104, 49], [-100, 46], [-100, 40], [-98, 36], [-101, 32.5], [-106.5, 31.8], [-111, 31.3], [-112.5, 33.5], [-111.5, 36], [-112, 40.5], [-113, 44], [-117, 46], [-117, 49]];
const MEXICO_CENTRAL_AMERICA = [[-117.1, 32.5], [-114.8, 32.5], [-111, 31.3], [-106.5, 31.8], [-103, 29], [-101, 29.8], [-99.5, 27.5], [-97, 26], [-97.7, 22], [-96, 19], [-94.5, 18.3], [-91, 18.6], [-90.4, 21], [-87, 21.5], [-88.2, 18.5], [-88.2, 15.8], [-84, 15.8], [-83.2, 14.9], [-83.6, 11], [-81.8, 8.9], [-79, 9.5], [-77.4, 8.6], [-78.2, 7.5], [-80.4, 7.3], [-82.9, 8.2], [-85.7, 10], [-87.5, 13], [-91.5, 14], [-94, 16], [-96.5, 15.7], [-101, 17.5], [-105.5, 20.3], [-105.6, 22.5], [-108.5, 25.2], [-112, 28.8], [-114.6, 31.5], [-117.1, 32.5]];
const CUBA = [[-85, 21.8], [-84, 23], [-80.5, 23.2], [-77, 22.2], [-74.1, 20.2], [-77.7, 19.8], [-80, 21.6], [-85, 21.8]];
const HISPANIOLA = [[-74.5, 18.3], [-72.8, 19.9], [-69.9, 19.7], [-68.3, 18.6], [-70.7, 18.1], [-74.5, 18.3]];

// --- South America (core Amazon, Atacama, most of Patagonia left sparse) ---
const ANDES_NORTH = [[-80.5, -4], [-80, 1], [-77.4, 8.6], [-75, 10.8], [-71.5, 12.4], [-68, 10.6], [-63, 10.7], [-60, 8.5], [-63, 7], [-67, 6], [-70, 4], [-72.5, 2], [-75, -0.5], [-77, -3], [-79, -5], [-80.5, -4]];
const ANDES_CENTRAL = [[-81.3, -4.8], [-79, -5], [-77, -6], [-76, -9], [-72, -13], [-68.8, -14.5], [-65, -17.5], [-64, -21.5], [-67, -23], [-70.4, -23.5], [-70.3, -18.3], [-75, -15.5], [-77.6, -11.5], [-79.5, -7.8], [-81.3, -4.8]];
const CHILE = [[-71.6, -30], [-70.2, -30], [-70, -33.5], [-70.5, -37], [-71.2, -41.5], [-72.5, -43], [-74, -42], [-73.5, -37], [-72, -33.5], [-71.6, -30]];
const SE_SOUTH_AMERICA = [[-35, -5.5], [-35.2, -9.5], [-39, -13.5], [-39.5, -18], [-41, -22.5], [-45, -24], [-48.5, -26.5], [-48.8, -28.6], [-51, -31.5], [-53.4, -33.8], [-56, -34.9], [-57.8, -34.4], [-57.4, -36], [-57.6, -38], [-62.3, -38.8], [-65, -36], [-65, -29], [-62, -24], [-58, -20], [-54, -16], [-50, -12], [-46.5, -8], [-42.5, -4], [-38.5, -3.7], [-35, -5.5]];

/** Region set for 2025 (ids reuse the Day 29 gm-* ids where they correspond, so morphs stay smooth). */
const MODERN_2025 = [
  R('gm-iberia', 'Iberia', IBERIA),
  R('gm-w-europe', 'Western / central Europe', W_CENTRAL_EUROPE),
  R('gm-italy', 'Italy', ITALY),
  R('gm-great-britain', 'Great Britain', GREAT_BRITAIN),
  R('gm-ireland', 'Ireland', IRELAND),
  R('gm-s-scandinavia', 'Southern Scandinavia', S_SCANDINAVIA),
  R('gm-s-finland', 'Southern Finland', S_FINLAND),
  R('gm-denmark', 'Denmark', DENMARK),
  R('gm-balkans', 'Balkans', BALKANS),
  R('gm-e-europe', 'Eastern Europe to the Urals', E_EUROPE),
  R('gm-anatolia-caucasus', 'Anatolia / Caucasus', ANATOLIA_CAUCASUS),
  R('gm-levant-mesopotamia', 'Levant / Mesopotamia', LEVANT_MESOPOTAMIA),
  R('gm-iran', 'Iranian plateau rim', IRAN),
  R('gm-arabia-west', 'Hejaz / Asir / Yemen', ARABIA_WEST),
  R('gm-arabia-gulf', 'Najd / Gulf coast / Oman', ARABIA_GULF),
  R('gm-nile-maghreb-east', 'Nile corridor (Egypt)', NILE_EGYPT),
  R('gm-nile-sudan', 'Nile corridor (Sudan)', NILE_SUDAN),
  R('gm-nile-maghreb', 'Maghreb', MAGHREB),
  R('gm-libya-coast', 'Libyan coast', LIBYA_COAST),
  R('gm-w-africa', 'Sahel / West Africa', SAHEL_WEST_AFRICA),
  R('gm-sudan-horn', 'Sudan savanna / Ethiopia / Horn', SUDAN_HORN),
  R('gm-central-africa-n', 'Northern Central Africa (rainforest core left sparse)', CENTRAL_AFRICA_N),
  R('gm-east-africa', 'East African Great Lakes / coast', EAST_AFRICA, ['lake-victoria']),
  R('gm-central-africa-s', 'Southern Central Africa', CENTRAL_AFRICA_S),
  R('gm-southern-africa', 'Southern Africa (Kalahari / Namib left sparse)', SOUTHERN_AFRICA),
  R('gm-madagascar', 'Madagascar', MADAGASCAR),
  R('gm-india', 'South Asia', SOUTH_ASIA),
  R('gm-sri-lanka', 'Sri Lanka', SRI_LANKA),
  R('gm-e-china', 'Eastern China', CHINA_EAST),
  R('gm-manchuria-korea', 'Manchuria / Korea', MANCHURIA_KOREA),
  R('gm-japan', 'Japan (Honshū / Kyūshū / Shikoku)', JAPAN_MAIN),
  R('gm-hokkaido', 'Hokkaidō', HOKKAIDO),
  R('gm-taiwan', 'Taiwan', TAIWAN),
  R('gm-central-asia', 'Kazakh steppe / Central Asian oases', CENTRAL_ASIA),
  R('gm-siberia-west', 'Southern Siberia (west)', SIBERIA_WEST),
  R('gm-siberia-east', 'Southern Siberia / Far East', SIBERIA_EAST),
  R('gm-se-asia', 'Mainland Southeast Asia', SE_ASIA_MAINLAND),
  R('gm-sumatra', 'Sumatra', SUMATRA),
  R('gm-java', 'Java', JAVA),
  R('gm-borneo-sw', 'Borneo south-west coast', BORNEO_SW),
  R('gm-borneo-n', 'Borneo north coast', BORNEO_N),
  R('gm-luzon', 'Luzon', LUZON),
  R('gm-visayas-mindanao', 'Visayas / Mindanao', VISAYAS_MINDANAO),
  R('gm-new-guinea', 'New Guinea highlands', NEW_GUINEA),
  R('gm-australia-east', 'Eastern / south-eastern Australia', AUSTRALIA_EAST),
  R('gm-australia-sw', 'South-west Australia', AUSTRALIA_SW),
  R('gm-australia-top-end', 'Top End', AUSTRALIA_TOP_END),
  R('gm-nz-north', 'Aotearoa — North Island', NZ_NORTH),
  R('gm-nz-south', 'Aotearoa — South Island', NZ_SOUTH),
  R('gm-hawaii', 'Hawaiʻi', HAWAII),
  R('gm-fiji', 'Fiji', FIJI),
  R('gm-e-us', 'Eastern / central United States', US_EAST),
  R('gm-canada-south', 'Southern Canada', CANADA_SOUTH),
  R('gm-us-pacific', 'US Pacific coast', US_PACIFIC),
  R('gm-us-interior-west', 'US interior west', US_INTERIOR_WEST),
  R('gm-mexico-central-america', 'Mexico / Central America', MEXICO_CENTRAL_AMERICA),
  R('gm-cuba', 'Cuba', CUBA),
  R('gm-hispaniola', 'Hispaniola', HISPANIOLA),
  R('gm-andes-north', 'Northern Andes / Caribbean coast', ANDES_NORTH),
  R('gm-andes-central', 'Central Andes / Pacific coast', ANDES_CENTRAL),
  R('gm-chile', 'Central Chile', CHILE),
  R('gm-se-brazil', 'Brazil coast / interior south / Pampas', SE_SOUTH_AMERICA),
];

/** 1900: nearly the same footprint; thinner frontiers (Siberian Far East, Prairies, Australia, US west). */
const LATER_SETTLED_BY_2025 = new Set(['gm-siberia-east', 'gm-australia-top-end', 'gm-hokkaido']);
const SHRINK_1900 = {
  'gm-canada-south': [[-114, 49], [-113.5, 51.5], [-106, 52.5], [-97.5, 50.5], [-92, 49.2], [-86, 48.8], [-80, 47], [-75, 46.6], [-71, 47.2], [-65.5, 48.5], [-64, 46], [-66.5, 45], [-71.5, 45.1], [-75, 45], [-79.5, 43.2], [-83, 45.5], [-88.5, 48.2], [-95, 49], [-114, 49]],
  'gm-us-interior-west': [[-112, 48.5], [-104, 48.5], [-100, 46], [-100, 40], [-98, 36], [-101, 32.5], [-106.5, 31.8], [-108, 33], [-106, 38], [-105, 42], [-111.5, 41], [-112, 48.5]],
  'gm-australia-east': [[138.5, -34.8], [141, -38.3], [146, -39.1], [150, -37.5], [153.5, -28], [152.5, -25], [150, -23], [149, -26], [147.5, -30], [144, -33], [140, -33.8], [138.5, -34.8]],
  'gm-siberia-west': [[60, 54], [61, 58], [75, 57], [86, 56.5], [86, 52], [80, 51.5], [73, 51.5], [66, 54], [60, 54]],
};
const MODERN_1900 = MODERN_2025.filter((r) => !LATER_SETTLED_BY_2025.has(r.id)).map((r) =>
  SHRINK_1900[r.id] ? { ...r, ring: SHRINK_1900[r.id] } : r,
);

export const GLOBAL_MODERN_KEYFRAMES = [
  { year: 1900, label: 'Inhabited world c. 1900 (schematic; frontiers thinner)', approximation: 'schematic', regions: MODERN_1900 },
  { year: 2025, label: 'Inhabited world today (deserts, tundra, ice and rainforest cores left sparse)', approximation: 'schematic', regions: MODERN_2025 },
];

/**
 * Year each regional hearth hands off to the inhabited-world layer (hearth holds its last footprint
 * until then, then dissolves inside the modern coverage instead of leaving a gap).
 */
export const HEARTH_HANDOFF_YEAR = {
  'fertile-crescent-presence': 1880,
  'nile-valley-presence': 1880,
  'yellow-river-presence': 1700,
  'indus-gangetic-presence': 1700,
  'mesoamerica-presence': 1880,
  'andean-presence': 1880,
  'west-africa-sahel-presence': 1700,
  'temperate-europe-presence': 1700,
  'southeast-asia-presence': 1880,
  'yangtze-presence': 1700,
  'ethiopian-highlands-presence': 1880,
  'east-southern-africa-presence': 1880,
  'eastern-woodlands-presence': 1850,
  'amazonia-presence': 1880,
  'japan-archipelago-presence': 1880,
  'aboriginal-australia-presence': 1880,
  'new-guinea-highlands-presence': 1880,
  'eurasian-steppe-presence': 1880,
  'pacific-islands-presence': 1880,
};

/**
 * Mutates presence entities: hearth hand-off keyframes + modern inhabited-world growth.
 * @param {object[]} entities
 */
export function applyModernPresence(entities) {
  for (const e of entities) {
    if (e.id === 'global-modern-presence') {
      e.name = 'Inhabited world (modern)';
      // Warm soft tint (was slate #CBD5E1, which read as haze once it covered whole continents).
      e.color = '#F2C57C';
      e.description =
        'Where people live in the modern era — grows to cover nearly all habitable land by 1900–2025, leaving the Sahara, Arabian and Australian interiors, the Gobi / Taklamakan / Tibetan core, Siberian and Canadian tundra, Greenland, Antarctica and the core Amazon, Congo and Borneo rainforests sparse. Presence, not density; schematic, many separate regions, never one ocean-spanning ring.';
      e.overlays = e.overlays.filter((o) => o.year < 1900).concat(GLOBAL_MODERN_KEYFRAMES);
      e.keyYears = [...new Set([...(e.keyYears || []).filter((y) => y < 1900), 1900, 2025])].sort((a, b) => a - b);
      continue;
    }
    const handoff = HEARTH_HANDOFF_YEAR[e.id];
    if (!handoff) continue;
    const last = e.overlays[e.overlays.length - 1];
    if (last.year >= handoff) continue;
    e.overlays.push({
      year: handoff,
      label: `${last.label || 'Inhabited footprint'} — continues until the modern layer takes over`,
      approximation: last.approximation || 'schematic',
      regions: last.regions,
    });
  }
  return entities;
}
