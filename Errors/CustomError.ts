export class CustomError {
  constructor(
    public status: number,
    public message: string,
    public details?: string | null,
    public trace?: Error | null
  ) {}
}
