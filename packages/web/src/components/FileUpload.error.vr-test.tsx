import * as stories from './FileUpload.stories';
import type { StoryTest } from '../../vr-tests/story-declarations';

export default {
  description: 'File upload error state',
  story: { value: stories.Error, module: stories, exportName: 'Error' },
} satisfies StoryTest;
