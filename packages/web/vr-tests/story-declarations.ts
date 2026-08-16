export type StoryModule = {
  default: { title?: string };
  [exportName: string]: unknown;
};

export type StoryTest = {
  description: string;
  story: {
    module: StoryModule;
    exportName: string;
  };
};
