import dayjs from "dayjs"

export default async function Test() {
  return (
    <div>
      <p>{dayjs('2023-07-15T08:23:48Z').format('YYYY-M-D H:m:s')}</p>
      <p>{dayjs('2023-07-15T08:47:25Z').format('YYYY-M-D H:m:s')}</p>
      <p>{dayjs(0).toISOString()}</p>
      <p>{dayjs('2023-07-15T09:27:07Z').format('YYYY-M-D H:m:s')}</p>
    </div>
  )
}