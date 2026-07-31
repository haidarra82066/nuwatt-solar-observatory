import type { NationalCapacityBenchmark } from "@/lib/types";

export const nationalCapacityBenchmark: NationalCapacityBenchmark = {
  asOf: "2023-12-31",
  published: "2025-04-01",
  totalCapacityMwp: 1081.27,
  methodology:
    "LCEC market assessment using company surveys, customs data, imported components, stock, and implementation assumptions.",
  sourceLabel: "LCEC Solar PV Status Report 2023",
  sourceUrl:
    "https://lcec.org.lb/sites/default/files/2025-10/Solar%20PV%20Status%20Report%202023_VF.pdf",
  regions: [
    { region: "Mount Lebanon", capacityMwp: 390.31, sharePercent: 36 },
    { region: "Beqaa", capacityMwp: 134.03, sharePercent: 12 },
    { region: "South Lebanon", capacityMwp: 119.86, sharePercent: 11 },
    { region: "North Lebanon", capacityMwp: 119.0, sharePercent: 11 },
    { region: "Nabatiyeh", capacityMwp: 100.4, sharePercent: 9 },
    { region: "Baalbek-Hermel", capacityMwp: 92.46, sharePercent: 9 },
    { region: "Beirut", capacityMwp: 72.18, sharePercent: 7 },
    { region: "Aakkar", capacityMwp: 53.03, sharePercent: 5 },
  ],
};
