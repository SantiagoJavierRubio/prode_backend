export class Validated {
  hasNulls(data: any[]): boolean {
    if (
      data.some((item) => {
        if (item === null || item === undefined) return true;
        return false;
      })
    )
      return true;
    return false;
  }
}
