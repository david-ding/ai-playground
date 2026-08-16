import * as stories from './FileUpload.stories';
import type { StoryTest } from '../../vr-tests/story-declarations';

export default {
  description: 'File upload uploading state',
  story: { module: stories, exportName: 'Uploading' },
} satisfies StoryTest;
