import { csvToJson } from "./csv";

export async function collectKindsFromCSV(source: string) {
  const records = await csvToJson(source);
  const kindMap: Map<string, number> = new Map();
  for (const { kind } of records) {
    if (kind) {
      if (kindMap.has(kind)) {
        const weight = kindMap.get(kind) as number;
        kindMap.set(kind, weight + 1);
      } else {
        kindMap.set(kind, 1);
      }
    }
  }
  return Array.from(kindMap.keys()).map((name) => ({
    name,
    weight: kindMap.get(name) as number,
  }));
}

export async function collectKindsFromFiles(files: File[]) {
  const kindsMap: Map<string, number> = new Map();
  const kindGroups = await Promise.all(
    files.map(async (file) => collectKindsFromCSV(file.content)),
  );
  for (const { name, weight } of kindGroups.flat()) {
    if (kindsMap.has(name)) {
      const currentWeight = kindsMap.get(name) as number;
      kindsMap.set(name, currentWeight + weight);
    } else {
      kindsMap.set(name, weight);
    }
  }
  return Array.from(kindsMap.keys()).map((name) => ({
    name,
    weight: kindsMap.get(name) as number,
  }));
}

interface File {
  name: string;
  content: string;
}
