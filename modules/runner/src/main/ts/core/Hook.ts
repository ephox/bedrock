import { ExecuteFn, Hook } from '@ephox/bedrock-common';
import * as Runnable from './Runnable';

export const createHook = (title: string, fn: ExecuteFn): Hook => {
  return Runnable.createRunnable(title, fn);
};