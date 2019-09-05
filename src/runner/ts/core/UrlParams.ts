import * as QS from 'querystringify';

export interface UrlParams {
  readonly session: number;
  readonly offset: number;
  readonly failed: number;
  retry: number;
}

const posInt = (str): number => {
  if (typeof str === 'string') {
    const num = parseInt(str, 10);
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }
  return 0;
};

const parse = (search: string, makeSessionId: () => string): UrlParams => {
  const params = QS.parse(search);
  return {
    session: params['session'] || makeSessionId(),
    offset: posInt(params['offset']),
    failed: posInt(params['failed']),
    retry: posInt(params['retry']),
  };
};

export const UrlParams = {
  parse,
  posInt
};