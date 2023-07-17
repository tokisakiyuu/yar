export interface ExpendRecord {
  /** 'V1StGXR8_Z5jdHi6B-myT' (nanoid) */
  rid: string
  /** e.g. '餐饮' '娱乐' '健身' '交通' */
  kind: string
  /** e.g. '早餐' '晚餐' '打车' */
  remark: string
  /** e.g. '-12.4' '28.8' */
  amount: string
  /** e.g. '2023-6-20' */
  date: string
}

interface AddOperation {
  type: 'add'
  record: ExpendRecord
}

interface DelOperation {
  type: 'delete'
  rid: string
}

interface ModifyOperation {
  type: 'modify'
  rid: string
  record: ExpendRecord
}

export type OperationRecord = AddOperation | DelOperation | ModifyOperation