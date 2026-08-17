export type StoryModule = {
  default: { title?: string };
  [exportName: string]: unknown;
};

export type StoryTest = {
  description: string;
  story: {
    value: unknown;
    module: StoryModule;
    exportName: string;
  };
};
