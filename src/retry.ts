export async function withRetry<T>(
  action: () => Promise<T>,
  attempts = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw lastError;
}
it('повторює спробу після невдачі', async () => {
  vi.useFakeTimers();
  const action = vi.fn()
    .mockRejectedValueOnce(new Error('TIMEOUT'))
    .mockResolvedValueOnce('ok');

  const promise = withRetry(action, 3, 1000);
  await vi.advanceTimersByTimeAsync(1000);

  await expect(promise).resolves.toBe('ok');
  expect(action).toHaveBeenCalledTimes(2);
  vi.useRealTimers();
});

it('після вичерпання спроб повертає останню помилку', async () => {
  vi.useFakeTimers();
  const action = vi.fn().mockRejectedValue(new Error('TIMEOUT'));

  const promise = withRetry(action, 3, 1000);
  const assertion = expect(promise).rejects.toThrow('TIMEOUT');
  await vi.advanceTimersByTimeAsync(2000);

  await assertion;
  expect(action).toHaveBeenCalledTimes(3);
  vi.useRealTimers();
});
