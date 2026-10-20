/** 把定稿里需要加重的那一句标出来，不改字。 */
export function FaqAnswer({ body, emphasis }: { body: string; emphasis?: string }) {
  if (!emphasis || !body.includes(emphasis)) return body;
  const [before, after] = body.split(emphasis);
  return (
    <>
      {before}
      <strong>{emphasis}</strong>
      {after}
    </>
  );
}
