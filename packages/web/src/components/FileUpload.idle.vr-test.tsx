import * as stories from './FileUpload.stories';
import type { StoryTest } from '../../vr-tests/story-declarations';

export default {
  description: 'File upload idle state',
  story: { module: stories, exportName: 'Idle' },
} satisfies StoryTest;
