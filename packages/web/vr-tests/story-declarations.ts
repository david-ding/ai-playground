export type StoryModule = {
  default: { title?: string };
  [exportName: string]: unknown;
};

export type StoryReference = {
  value: unknown;
  module: StoryModule;
  exportName: string;
};

export function createStoryReference<
  M extends StoryModule,
  K extends Exclude<keyof M, 'default'> & string,
>(module: M, exportName: K): StoryReference {
  return { value: module[exportName], module, exportName };
}

export type StoryTest = {
  description: string;
  story: StoryReference;
};
