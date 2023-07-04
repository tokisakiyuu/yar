import * as csv from 'fast-csv'

/**
 * `json object` => `csv string`
 * 
 * the important thing is this process will holds the data type.
 * @example
 * ```js
 * [
 *    { name: 'Jim', age: 19 },
 *    { name: 'Tom', age: 20 }
 * ]
 * ```
 * to
 * ```csv
 * name,age
 * ""jim"",19
 * ""Tom"",20
 * ```
 */
export async function buildCsv(table: Record<string, any>[]): Promise<string> {
  return jsonToCsv(table.map(row => rowValueStringify(row)))
}

/**
 * its reverse process
 */
export async function parseCsv(source: string): Promise<Record<string, any>[]> {
  const rawTable = await csvToJson(source)
  return rawTable.map(row => rowValueParse(row))
}

function rowValueStringify(row: Record<string, any>): CsvRowType {
  return Object.keys(row).reduce<CsvRowType>((obj, key, i) => {
    obj[key] = JSON.stringify(row[key])
    return obj
  }, {})
}

function rowValueParse(row: CsvRowType): Record<string, any> {
  return Object.keys(row).reduce<Record<string, any>>((obj, key, i) => {
    const target = row[key]
    if (target.length) {
      obj[key] = JSON.parse(target)
    }
    return obj
  }, {})
}

type CsvRowType = Record<string, string>

async function csvToJson(raw: string): Promise<CsvRowType[]> {
  return new Promise((resolve, reject) => {
    const result: CsvRowType[] = []
    csv.parseString(raw, { headers: true })
      .on('error', reject)
      .on('data', (row: CsvRowType) => result.push(row))
      .on('end', () => resolve(result))
  })
}

async function jsonToCsv(json: CsvRowType[]): Promise<string> {
  return new Promise((resovle, reject) => {
    const lines: string[] = []
    const stream = csv.format({ headers: true })
    stream.on('data', line => lines.push(Buffer.from(line).toString('utf-8')))
    stream.on('error', reject)
    stream.on('end', () => resovle(lines.join('')))
    json.forEach(row => stream.write(row))
    stream.end()
  })
}