import * as stories from './FileUpload.stories';
import { createStoryReference, type StoryTest } from '../../vr-tests/story-declarations';

export default {
  description: 'File upload completed state',
  story: createStoryReference(stories, 'Done'),
} satisfies StoryTest;
