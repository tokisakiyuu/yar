import { ExpendRecord, OperationRecord } from './types'

export default function recordsCalculator(source: ExpendRecord[], ops: OperationRecord[]): ExpendRecord[] {
  const map: Map<string, ExpendRecord> = source.reduce((map, item) => {
    map.set(item.rid, item)
    return map
  }, new Map())
  for (const op of ops) {
    const { type } = op
    if (type === 'add') {
      map.set(op.record.rid, op.record)
    }
    if (type === 'delete') {
      map.delete(op.rid)
    }
    if (type === 'modify') {
      map.set(op.rid, op.record)
    }
  }
  return Array.from(map.values())
}