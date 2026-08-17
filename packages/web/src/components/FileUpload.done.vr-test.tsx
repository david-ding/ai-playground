import * as stories from './FileUpload.stories';
import type { StoryTest } from '../../vr-tests/story-declarations';

export default {
  description: 'File upload completed state',
  story: { value: stories.Done, module: stories, exportName: 'Done' },
} satisfies StoryTest;
