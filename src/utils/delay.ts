export default async function delay(ms: number) {
  return await new Promise(() => setTimeout(() => {}, ms));
}
