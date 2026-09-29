export function readRouteParamId(param: string | string[] | undefined): string {
  if (typeof param === 'string') {
    return param;
  }

  if (Array.isArray(param)) {
    return param[0] ?? '';
  }

  return '';
}
