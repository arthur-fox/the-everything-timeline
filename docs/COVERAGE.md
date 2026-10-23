# Coverage checklist: every place on both Timeline and Globe

Goal (Arthur, 15 Oct 2026): every ISO 3166-1 entry — ~195 sovereign states plus dependent territories, 249 rows — covered on **both** the Timeline and the Globe. See ROADMAP.md, Phase 5.

Built once from the ISO 3166-1 list (UN M49 regions) and the repo data on 15 Oct 2026. It's a plain hand-kept table: update a row in the same PR as the pack that changes it.

**Status meanings**

- **Timeline:** `done` = has its own sourced country timeline in `data/countries/` (a first pass; packs may still deepen it). `partial` = appears only inside topic views or another country. `none` = no country timeline yet.
- **Globe:** `done` = full history refined by a Phase 5 pack (shapes over time with certainty levels, dated cities, pinned events, timeline links). `partial` = only today's/1815–2025 nation borders (or drawn inside another state), plus whatever older empire overlays happen to cross it. `none` = not drawn as its own land at all (mostly tiny islands below Natural Earth's scale).
- **Pack / region:** where it gets done. Small territories batch with their region pack.

**Totals now (249 places):** Timeline done 38, partial 0, none 211. Globe done 4, partial 192, none 53.

Honest caveat: only Peru (Day 65: 17 polities from Caral to the Neo-Inca State, 19 cities, 17 pins, links both ways) Ghana (Day 66: 10 polities from Bono to the Fante coast and the northern kingdoms, 18 cities, 24 pins) Morocco (Day 68: 20 polities and enclave holders from the Mauri kings to the Alaouites, 20 cities, 54 pins) and Kenya (Day 69: 11 Swahili town-states, Portuguese and Mazrui Mombasa and the Wanga Kingdom, 16 cities, 50 pins) are Globe `done` so far. The rest of pack 1 (Iraq, Philippines) is still timeline-only on the globe and comes next. `done` means a first full pass, not the last word: Tiwanaku and the Bolivian / Chilean Andes wait for their own packs, Ghana's smaller states (Wassa, Nzema, the Ewe, Krobo) for the West Africa pass, and Morocco's lesser powers (al-Ayyashi, Tetouan's Naqsis, the Hintata, Ceuta's Azafids) and Algeria / Tunisia's own dynasties (Rustamids, Zirids, Hammadids, Hafsids, Zayyanids) for the Maghreb pass, and Kenya's smaller coast towns (Ungwana, Mnarani, Vumba Kuu), the Mijikenda, Kamba, Maasai and Kikuyu lands, and the Somali and Oromo north for the East Africa pass.

**All 53 Globe `none` rows are scheduled** (ROADMAP Phase 5, "Places with nothing drawn yet"). Each will get a high-res close-zoom outline, or a tappable labelled marker where a shape isn't practical, in its region pack. Antarctica gets research stations plus dated territorial claims and the 1959 Antarctic Treaty. Their Notes say `scheduled: outline or marker`.

| Place | ISO | Timeline | Globe | Pack / region | Notes |
|---|---|---|---|---|---|
| Australia | AU | done | partial | Australia and New Zealand | modern borders 1815/1914–2025 |
| New Zealand | NZ | none | partial | Australia and New Zealand | modern borders 1815/1914–2025 |
| Anguilla | AI | none | none | Caribbean & Central America | scheduled: outline or marker |
| Antigua and Barbuda | AG | none | none | Caribbean & Central America | scheduled: outline or marker |
| Aruba | AW | none | none | Caribbean & Central America | scheduled: outline or marker |
| Bahamas | BS | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Barbados | BB | none | none | Caribbean & Central America | scheduled: outline or marker |
| Belize | BZ | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Bonaire, Sint Eustatius and Saba | BQ | none | none | Caribbean & Central America | scheduled: outline or marker |
| Cayman Islands | KY | none | none | Caribbean & Central America | scheduled: outline or marker |
| Costa Rica | CR | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Cuba | CU | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Curaçao | CW | none | none | Caribbean & Central America | scheduled: outline or marker |
| Dominica | DM | none | none | Caribbean & Central America | scheduled: outline or marker |
| Dominican Republic | DO | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| El Salvador | SV | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Grenada | GD | none | none | Caribbean & Central America | scheduled: outline or marker |
| Guadeloupe | GP | none | none | Caribbean & Central America | scheduled: outline or marker |
| Guatemala | GT | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Haiti | HT | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Honduras | HN | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Jamaica | JM | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Martinique | MQ | none | none | Caribbean & Central America | scheduled: outline or marker |
| Mexico | MX | done | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Montserrat | MS | none | none | Caribbean & Central America | scheduled: outline or marker |
| Nicaragua | NI | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Panama | PA | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Puerto Rico | PR | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Saint Barthélemy | BL | none | none | Caribbean & Central America | scheduled: outline or marker |
| Saint Kitts and Nevis | KN | none | none | Caribbean & Central America | scheduled: outline or marker |
| Saint Lucia | LC | none | none | Caribbean & Central America | scheduled: outline or marker |
| Saint Martin (French part) | MF | none | none | Caribbean & Central America | scheduled: outline or marker |
| Saint Vincent and the Grenadines | VC | none | none | Caribbean & Central America | scheduled: outline or marker |
| Sint Maarten (Dutch part) | SX | none | none | Caribbean & Central America | scheduled: outline or marker |
| Trinidad and Tobago | TT | none | partial | Caribbean & Central America | modern borders 1815/1914–2025 |
| Turks and Caicos Islands | TC | none | none | Caribbean & Central America | scheduled: outline or marker |
| Virgin Islands (British) | VG | none | none | Caribbean & Central America | scheduled: outline or marker |
| Virgin Islands (U.S.) | VI | none | none | Caribbean & Central America | scheduled: outline or marker |
| Armenia | AM | none | partial | Caucasus | modern borders 1815/1914–2025 |
| Azerbaijan | AZ | none | partial | Caucasus | modern borders 1815/1914–2025 |
| Georgia | GE | none | partial | Caucasus | modern borders 1815/1914–2025 |
| Angola | AO | none | partial | Central Africa | modern borders 1815/1914–2025 |
| Cameroon | CM | none | partial | Central Africa | modern borders 1815/1914–2025 |
| Central African Republic | CF | none | partial | Central Africa | modern borders 1815/1914–2025 |
| Chad | TD | none | partial | Central Africa | modern borders 1815/1914–2025 |
| Congo | CG | none | partial | Central Africa | modern borders 1815/1914–2025 |
| Congo, Democratic Republic of the | CD | none | partial | Central Africa | modern borders 1815/1914–2025 |
| Equatorial Guinea | GQ | none | partial | Central Africa | modern borders 1815/1914–2025 |
| Gabon | GA | none | partial | Central Africa | modern borders 1815/1914–2025 |
| Sao Tome and Principe | ST | none | partial | Central Africa | modern borders 1815/1914–2025 |
| Afghanistan | AF | none | partial | Central Asia | modern borders 1815/1914–2025 |
| Kazakhstan | KZ | none | partial | Central Asia | modern borders 1815/1914–2025 |
| Kyrgyzstan | KG | none | partial | Central Asia | modern borders 1815/1914–2025 |
| Tajikistan | TJ | none | partial | Central Asia | modern borders 1815/1914–2025 |
| Turkmenistan | TM | none | partial | Central Asia | modern borders 1815/1914–2025 |
| Uzbekistan | UZ | none | partial | Central Asia | modern borders 1815/1914–2025 |
| British Indian Ocean Territory | IO | none | none | Eastern Africa | scheduled: outline or marker |
| Burundi | BI | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| Comoros | KM | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| Djibouti | DJ | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| Eritrea | ER | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| Ethiopia | ET | done | partial | Eastern Africa | modern borders 1815/1914–2025 |
| Madagascar | MG | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| Malawi | MW | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| Mauritius | MU | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| Mayotte | YT | none | none | Eastern Africa | scheduled: outline or marker |
| Mozambique | MZ | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| Rwanda | RW | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| Réunion | RE | none | none | Eastern Africa | scheduled: outline or marker |
| Seychelles | SC | none | none | Eastern Africa | scheduled: outline or marker |
| Somalia | SO | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| South Sudan | SS | none | partial | Eastern Africa | modern borders 2011–2025 |
| Tanzania, United Republic of | TZ | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| Uganda | UG | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| Zambia | ZM | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| Zimbabwe | ZW | none | partial | Eastern Africa | modern borders 1815/1914–2025 |
| China | CN | done | partial | Eastern Asia | modern borders 1815/1914–2025 |
| Hong Kong | HK | none | partial | Eastern Asia | modern borders 1815/1914–2025 |
| Japan | JP | done | partial | Eastern Asia | modern borders 1815/1914–2025 |
| Korea, Democratic People's Republic of | KP | none | partial | Eastern Asia | modern borders 1815/1914–2025 |
| Korea, Republic of | KR | done | partial | Eastern Asia | modern borders 1815/1914–2025 |
| Macao | MO | none | partial | Eastern Asia | modern borders 1815/1914–2025 |
| Mongolia | MN | none | partial | Eastern Asia | modern borders 1815/1914–2025 |
| Belarus | BY | none | partial | Eastern Europe | modern borders 1815/1914–2025 |
| Czechia | CZ | none | partial | Eastern Europe | modern borders 1815/1914–2025 |
| Hungary | HU | none | partial | Eastern Europe | modern borders 1815/1914–2025 |
| Poland | PL | done | partial | Eastern Europe | modern borders 1815/1914–2025 |
| Russian Federation | RU | done | partial | Eastern Europe | modern borders 1815/1914–2025 |
| Slovakia | SK | none | partial | Eastern Europe | modern borders 1815/1914–2025 |
| Ukraine | UA | none | partial | Eastern Europe | modern borders 1815/1914–2025 |
| Algeria | DZ | none | partial | Northern Africa | modern borders 1815/1914–2025 |
| Egypt | EG | done | partial | Northern Africa | modern borders 1815/1914–2025 |
| Libya | LY | none | partial | Northern Africa | modern borders 1815/1914–2025 |
| Sudan | SD | none | partial | Northern Africa | modern borders 1815/1914–2025 |
| Tunisia | TN | none | partial | Northern Africa | modern borders 1815/1914–2025 |
| Western Sahara | EH | none | partial | Northern Africa | modern borders (disputed, grey) |
| Bermuda | BM | none | none | Northern America | scheduled: outline or marker |
| Canada | CA | done | partial | Northern America | modern borders 1815/1914–2025 |
| Greenland | GL | none | partial | Northern America | modern borders 1815/1914–2025 |
| Saint Pierre and Miquelon | PM | none | none | Northern America | scheduled: outline or marker |
| United States of America | US | done | partial | Northern America | modern borders 1815/1914–2025 |
| Denmark | DK | none | partial | Northern Europe | modern borders 1815/1914–2025 |
| Estonia | EE | none | partial | Northern Europe | modern borders 1815/1914–2025 |
| Faroe Islands | FO | none | partial | Northern Europe | modern borders 1815/1914–2025 |
| Finland | FI | none | partial | Northern Europe | modern borders 1815/1914–2025 |
| Guernsey | GG | none | partial | Northern Europe | modern borders 1815/1914–2025 |
| Iceland | IS | none | partial | Northern Europe | modern borders 1815/1914–2025 |
| Ireland | IE | none | partial | Northern Europe | modern borders 1815/1914–2025 |
| Isle of Man | IM | none | partial | Northern Europe | modern borders 1815/1914–2025 |
| Jersey | JE | none | partial | Northern Europe | modern borders 1815/1914–2025 |
| Latvia | LV | none | partial | Northern Europe | modern borders 1815/1914–2025 |
| Lithuania | LT | none | partial | Northern Europe | modern borders 1815/1914–2025 |
| Norway | NO | none | partial | Northern Europe | modern borders 1815/1914–2025 |
| Svalbard and Jan Mayen | SJ | none | none | Northern Europe | scheduled: outline or marker |
| Sweden | SE | done | partial | Northern Europe | modern borders 1815/1914–2025 |
| United Kingdom of Great Britain and Northern Ireland | GB | done | partial | Northern Europe | modern borders 1815/1914–2025 |
| Åland Islands | AX | none | none | Northern Europe | scheduled: outline or marker |
| American Samoa | AS | none | none | Pacific islands | scheduled: outline or marker |
| Christmas Island | CX | none | none | Pacific islands | scheduled: outline or marker |
| Cocos (Keeling) Islands | CC | none | none | Pacific islands | scheduled: outline or marker |
| Cook Islands | CK | none | none | Pacific islands | scheduled: outline or marker |
| Fiji | FJ | none | partial | Pacific islands | modern borders 1815/1914–2025 |
| French Polynesia | PF | none | partial | Pacific islands | modern borders 1815/1914–2025 |
| Guam | GU | none | none | Pacific islands | scheduled: outline or marker |
| Heard Island and McDonald Islands | HM | none | none | Pacific islands | scheduled: outline or marker |
| Kiribati | KI | none | none | Pacific islands | scheduled: outline or marker |
| Marshall Islands | MH | none | none | Pacific islands | scheduled: outline or marker |
| Micronesia, Federated States of | FM | none | none | Pacific islands | scheduled: outline or marker |
| Nauru | NR | none | none | Pacific islands | scheduled: outline or marker |
| New Caledonia | NC | none | partial | Pacific islands | modern borders 1815/1914–2025 |
| Niue | NU | none | none | Pacific islands | scheduled: outline or marker |
| Norfolk Island | NF | none | none | Pacific islands | scheduled: outline or marker |
| Northern Mariana Islands | MP | none | none | Pacific islands | scheduled: outline or marker |
| Palau | PW | none | none | Pacific islands | scheduled: outline or marker |
| Papua New Guinea | PG | none | partial | Pacific islands | modern borders 1815/1914–2025 |
| Pitcairn | PN | none | none | Pacific islands | scheduled: outline or marker |
| Samoa | WS | none | partial | Pacific islands | modern borders 1815/1914–2025 |
| Solomon Islands | SB | none | partial | Pacific islands | modern borders 1815/1914–2025 |
| Tokelau | TK | none | none | Pacific islands | scheduled: outline or marker |
| Tonga | TO | none | partial | Pacific islands | modern borders 1815/1914–2025 |
| Tuvalu | TV | none | none | Pacific islands | scheduled: outline or marker |
| United States Minor Outlying Islands | UM | none | none | Pacific islands | scheduled: outline or marker |
| Vanuatu | VU | none | partial | Pacific islands | modern borders 1815/1914–2025 |
| Wallis and Futuna | WF | none | none | Pacific islands | scheduled: outline or marker |
| Ghana | GH | done | done | Pack 1 globe backfill | Day 66: Bono, Denkyira, Akwamu, Akyem, Great Accra, Fante, Dagbon, Mamprugu, Gonja, Asante redrawn to the coast (1350–1815), 18 cities, 24 pins, +3 timeline items |
| Iraq | IQ | done | partial | Pack 1 globe backfill | modern borders 1815/1914–2025 |
| Kenya | KE | done | done | Pack 1 globe backfill | Day 69: Shanga, Manda, Gedi, Mombasa (Mvita), Malindi, Lamu, Pate, Siyu and Faza, Portuguese Mombasa (Fort Jesus), Omani and Mazrui Mombasa, the Wanga Kingdom (760–1815), 16 cities, 50 pins, +4 timeline items |
| Morocco | MA | done | done | Pack 1 globe backfill | Day 68: Mauretania, Roman Tingitana, Barghawata, Idrisids, Nekor, Sijilmasa, Maghrawa / Banu Ifran, Almoravids, Almohads, Marinids, Wattasids, Saadians, Tazerwalt, Dila, Salé, Alaouites and the Portuguese / Spanish / English enclaves (−206–1815), 20 cities, 54 pins, +4 timeline items |
| Peru | PE | done | done | Pack 1 globe backfill | Day 65: Norte Chico → Neo-Inca State keyframes, 19 cities, 17 pins, Inca / Spanish / Andean shapes redrawn to the coast |
| Philippines | PH | done | partial | Pack 1 globe backfill | modern borders 1815/1914–2025 |
| Antarctica | AQ | none | none | Polar & remote (batch) | scheduled: stations + dated claims (1959 Treaty) |
| Bouvet Island | BV | none | none | Polar & remote (batch) | scheduled: outline or marker |
| French Southern Territories | TF | none | partial | Polar & remote (batch) | modern borders 1815/1914–2025 |
| South Georgia and the South Sandwich Islands | GS | none | partial | Polar & remote (batch) | modern borders 1815/1914–2025 |
| Taiwan, Province of China | TW | none | partial | Polar & remote (batch) | modern borders 1815/1914–2025 |
| Argentina | AR | done | partial | South America | modern borders 1815/1914–2025 |
| Bolivia, Plurinational State of | BO | none | partial | South America | modern borders 1815/1914–2025 |
| Brazil | BR | done | partial | South America | modern borders 1815/1914–2025 |
| Chile | CL | none | partial | South America | modern borders 1815/1914–2025 |
| Colombia | CO | none | partial | South America | modern borders 1815/1914–2025 |
| Ecuador | EC | none | partial | South America | modern borders 1815/1914–2025 |
| Falkland Islands (Malvinas) | FK | none | partial | South America | modern borders 1815/1914–2025 |
| French Guiana | GF | none | partial | South America | modern borders 1815/1914–2025 (drawn as part of france) |
| Guyana | GY | none | partial | South America | modern borders 1815/1914–2025 |
| Paraguay | PY | none | partial | South America | modern borders 1815/1914–2025 |
| Suriname | SR | none | partial | South America | modern borders 1815/1914–2025 |
| Uruguay | UY | none | partial | South America | modern borders 1815/1914–2025 |
| Venezuela, Bolivarian Republic of | VE | none | partial | South America | modern borders 1815/1914–2025 |
| Bangladesh | BD | none | partial | South Asia | modern borders 1815/1914–2025 |
| Bhutan | BT | none | partial | South Asia | modern borders 1815/1914–2025 |
| India | IN | done | partial | South Asia | modern borders 1815/1914–2025 |
| Iran, Islamic Republic of | IR | done | partial | South Asia | modern borders 1815/1914–2025 |
| Maldives | MV | none | partial | South Asia | modern borders 1815/1914–2025 |
| Nepal | NP | none | partial | South Asia | modern borders 1815/1914–2025 |
| Pakistan | PK | done | partial | South Asia | modern borders 1815/1914–2025 |
| Sri Lanka | LK | none | partial | South Asia | modern borders 1815/1914–2025 |
| Brunei Darussalam | BN | none | partial | South-eastern Asia | modern borders 1815/1914–2025 |
| Cambodia | KH | none | partial | South-eastern Asia | modern borders 1815/1914–2025 |
| Indonesia | ID | done | partial | South-eastern Asia | modern borders 1815/1914–2025 |
| Lao People's Democratic Republic | LA | none | partial | South-eastern Asia | modern borders 1815/1914–2025 |
| Malaysia | MY | none | partial | South-eastern Asia | modern borders 1815/1914–2025 |
| Myanmar | MM | none | partial | South-eastern Asia | modern borders 1815/1914–2025 |
| Singapore | SG | none | partial | South-eastern Asia | modern borders 1815/1914–2025 |
| Thailand | TH | done | partial | South-eastern Asia | modern borders 1815/1914–2025 |
| Timor-Leste | TL | none | partial | South-eastern Asia | modern borders 1815/1914–2025 |
| Viet Nam | VN | done | partial | South-eastern Asia | modern borders 1815/1914–2025 |
| Albania | AL | none | partial | Southeast Europe | modern borders 1815/1914–2025 |
| Bosnia and Herzegovina | BA | none | partial | Southeast Europe | modern borders 1815/1914–2025 |
| Bulgaria | BG | none | partial | Southeast Europe | modern borders 1815/1914–2025 |
| Croatia | HR | none | partial | Southeast Europe | modern borders 1815/1914–2025 |
| Greece | GR | done | partial | Southeast Europe | modern borders 1815/1914–2025 |
| Moldova, Republic of | MD | none | partial | Southeast Europe | modern borders 1815/1914–2025 |
| Montenegro | ME | none | partial | Southeast Europe | modern borders 1815/1914–2025 |
| North Macedonia | MK | none | partial | Southeast Europe | modern borders 1815/1914–2025 |
| Romania | RO | none | partial | Southeast Europe | modern borders 1815/1914–2025 |
| Serbia | RS | none | partial | Southeast Europe | modern borders 1815/1914–2025 |
| Slovenia | SI | none | partial | Southeast Europe | modern borders 1815/1914–2025 |
| Botswana | BW | none | partial | Southern Africa | modern borders 1815/1914–2025 |
| Eswatini | SZ | none | partial | Southern Africa | modern borders 1815/1914–2025 |
| Lesotho | LS | none | partial | Southern Africa | modern borders 1815/1914–2025 |
| Namibia | NA | none | partial | Southern Africa | modern borders 1815/1914–2025 |
| South Africa | ZA | done | partial | Southern Africa | modern borders 1815/1914–2025 |
| Andorra | AD | none | partial | Southern Europe | modern borders 1815/1914–2025 |
| Gibraltar | GI | none | none | Southern Europe | scheduled: outline or marker |
| Holy See | VA | none | none | Southern Europe | scheduled: outline or marker |
| Italy | IT | done | partial | Southern Europe | modern borders 1815/1914–2025 |
| Malta | MT | none | partial | Southern Europe | modern borders 1815/1914–2025 |
| Portugal | PT | done | partial | Southern Europe | modern borders 1815/1914–2025 |
| San Marino | SM | none | partial | Southern Europe | modern borders 1815/1914–2025 |
| Spain | ES | done | partial | Southern Europe | modern borders 1815/1914–2025 |
| Benin | BJ | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Burkina Faso | BF | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Cabo Verde | CV | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Côte d'Ivoire | CI | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Gambia | GM | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Guinea | GN | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Guinea-Bissau | GW | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Liberia | LR | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Mali | ML | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Mauritania | MR | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Niger | NE | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Nigeria | NG | done | partial | Western Africa | modern borders 1815/1914–2025 |
| Saint Helena, Ascension and Tristan da Cunha | SH | none | none | Western Africa | scheduled: outline or marker |
| Senegal | SN | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Sierra Leone | SL | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Togo | TG | none | partial | Western Africa | modern borders 1815/1914–2025 |
| Bahrain | BH | none | partial | Western Asia | modern borders 1815/1914–2025 |
| Cyprus | CY | none | partial | Western Asia | modern borders 1815/1914–2025 |
| Israel | IL | none | partial | Western Asia | modern borders 1815/1914–2025 |
| Jordan | JO | none | partial | Western Asia | modern borders 1815/1914–2025 |
| Kuwait | KW | none | partial | Western Asia | modern borders 1815/1914–2025 |
| Lebanon | LB | none | partial | Western Asia | modern borders 1815/1914–2025 |
| Oman | OM | none | partial | Western Asia | modern borders 1815/1914–2025 |
| Palestine, State of | PS | none | partial | Western Asia | modern borders (disputed, grey) |
| Qatar | QA | none | partial | Western Asia | modern borders 1815/1914–2025 |
| Saudi Arabia | SA | done | partial | Western Asia | modern borders 1815/1914–2025 |
| Syrian Arab Republic | SY | none | partial | Western Asia | modern borders 1815/1914–2025 |
| Türkiye | TR | done | partial | Western Asia | modern borders 1815/1914–2025 |
| United Arab Emirates | AE | none | partial | Western Asia | modern borders 1815/1914–2025 |
| Yemen | YE | none | partial | Western Asia | modern borders 1815/1914–2025 |
| Austria | AT | none | partial | Western Europe | modern borders 1815/1914–2025 |
| Belgium | BE | none | partial | Western Europe | modern borders 1815/1914–2025 |
| France | FR | done | partial | Western Europe | modern borders 1815/1914–2025 |
| Germany | DE | done | partial | Western Europe | modern borders 1815/1914–2025 |
| Liechtenstein | LI | none | partial | Western Europe | modern borders 1815/1914–2025 |
| Luxembourg | LU | none | partial | Western Europe | modern borders 1815/1914–2025 |
| Monaco | MC | none | partial | Western Europe | modern borders 1815/1914–2025 |
| Netherlands, Kingdom of the | NL | done | partial | Western Europe | modern borders 1815/1914–2025 |
| Switzerland | CH | none | partial | Western Europe | modern borders 1815/1914–2025 |
