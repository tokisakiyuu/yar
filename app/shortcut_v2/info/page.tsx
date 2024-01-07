import { kv } from "@vercel/kv";

const InfoPage = async () => {
  const records = await kv.zrange("records", 0, -1);
  return (
    <>
      <div className="">{JSON.stringify(records, null, 2)}</div>
      <div className="mt-2">
        <a className="p-2 text-blue" href="./clearCachedRecords">
          clear
        </a>
        <a className="p-2 text-blue" href="./undo">
          undo
        </a>
        <a className="p-2 text-blue" href="./undoSync">
          undoSync
        </a>
        <a className="p-2 text-blue" href="./sync">
          sync
        </a>
      </div>
    </>
  );
};

export default InfoPage;
