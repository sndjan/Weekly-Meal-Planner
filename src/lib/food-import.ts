import type { FoodColor } from '@/types/database';

export type ParsedFoodItemImport = {
  name: string;
  is_plant: boolean;
  is_legume: boolean;
  is_fermented: boolean;
  is_whole_grain: boolean;
  has_added_sugar: boolean;
  is_processed: boolean;
  color: FoodColor | null;
};

export type FoodImportResult = {
  items: ParsedFoodItemImport[];
  warnings: string[];
};

type BooleanField = 'is_plant' | 'is_legume' | 'is_fermented' | 'is_whole_grain' | 'has_added_sugar' | 'is_processed';

const BOOLEAN_KEY_MAP: Record<string, BooleanField> = {
  plant: 'is_plant',
  legume: 'is_legume',
  fermented: 'is_fermented',
  wholegrain: 'is_whole_grain',
  addedsugar: 'has_added_sugar',
  processed: 'is_processed',
};

const VALID_COLORS: FoodColor[] = ['red', 'yellow', 'green', 'purple', 'brown'];

/**
 * Parses lines like:
 *   Süßkartoffel (Plant=true;Legume=false;Fermented=false;Whole grain=false;Added sugar=false;Processed=false;Color=orange)
 *   Whey Protein (Plant=false;Legume=false;Fermented=false;Whole grain=false;Added sugar=true;Processed=true)
 * Attributes are optional and order-independent; unrecognized attributes/colors are
 * reported as warnings rather than failing the whole line.
 */
export function parseFoodImportText(text: string): FoodImportResult {
  const items: ParsedFoodItemImport[] = [];
  const warnings: string[] = [];

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const match = line.match(/^(.+?)\s*\(([^)]*)\)\s*$/);

    if (!match) {
      warnings.push(
        `Zeile ${lineNumber}: "${line}" konnte nicht verarbeitet werden (erwartet: "Name (key=value;...)")`,
      );
      return;
    }

    const name = (match[1] ?? '').trim();
    const attributesRaw = match[2] ?? '';

    if (!name) {
      warnings.push(`Zeile ${lineNumber}: Lebensmittelname fehlt`);
      return;
    }

    const item: ParsedFoodItemImport = {
      name,
      is_plant: false,
      is_legume: false,
      is_fermented: false,
      is_whole_grain: false,
      has_added_sugar: false,
      is_processed: false,
      color: null,
    };

    attributesRaw
      .split(';')
      .map((pair) => pair.trim())
      .filter((pair) => pair.length > 0)
      .forEach((pair) => {
        const separatorIndex = pair.indexOf('=');

        if (separatorIndex === -1) {
          warnings.push(`Zeile ${lineNumber} (${name}): Attribut "${pair}" konnte nicht verarbeitet werden`);
          return;
        }

        const rawKey = pair.slice(0, separatorIndex).trim();
        const value = pair.slice(separatorIndex + 1).trim();
        const normalizedKey = rawKey.toLowerCase().replace(/\s+/g, '');

        if (normalizedKey === 'color') {
          const normalizedColor = value.toLowerCase();

          if (VALID_COLORS.includes(normalizedColor as FoodColor)) {
            item.color = normalizedColor as FoodColor;
          } else if (value.length > 0) {
            warnings.push(
              `Zeile ${lineNumber} (${name}): unbekannte Farbe "${value}", ohne Farbe übernommen`,
            );
          }
          return;
        }

        const booleanField = BOOLEAN_KEY_MAP[normalizedKey];

        if (!booleanField) {
          warnings.push(`Zeile ${lineNumber} (${name}): unbekanntes Attribut "${rawKey}"`);
          return;
        }

        const normalizedValue = value.toLowerCase();

        if (normalizedValue === 'true') {
          item[booleanField] = true;
        } else if (normalizedValue === 'false') {
          item[booleanField] = false;
        } else {
          warnings.push(
            `Zeile ${lineNumber} (${name}): "${rawKey}" sollte true/false sein, war "${value}"`,
          );
        }
      });

    items.push(item);
  });

  return { items, warnings };
}
