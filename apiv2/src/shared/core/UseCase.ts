export interface UseCase<R> {
  execute(...args: any[]): Promise<R>;
}
