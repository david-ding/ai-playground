import * as stories from './FileUpload.stories';
import type { StoryTest } from '../../vr-tests/story-declarations';

export default {
  description: 'File upload requesting URL state',
  story: { module: stories, exportName: 'RequestingUrl' },
} satisfies StoryTest;
