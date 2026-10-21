/**
 * Перетворює кількість секунд на рядок формату «гг:хх:сс».
 *
 * @param totalSeconds невід'ємна кількість секунд (ціле число)
 * @returns рядок, де години, хвилини й секунди мають щонайменше два знаки
 * @throws INVALID_SECONDS, якщо значення від'ємне, дробове або не є числом
 */
export function secondsToTimeString(totalSeconds: number): string {
  if (!Number.isInteger(totalSeconds) || totalSeconds < 0) {
    throw new Error('INVALID_SECONDS');
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (value: number): string => String(value).padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}