import * as stories from './FileUpload.stories';
import { createStoryReference, type StoryTest } from '../../vr-tests/story-declarations';

export default {
  description: 'File upload error state',
  story: createStoryReference(stories, 'Error'),
} satisfies StoryTest;
