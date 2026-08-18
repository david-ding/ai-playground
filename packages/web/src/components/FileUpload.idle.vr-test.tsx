import * as stories from './FileUpload.stories';
import { createStoryReference, type StoryTest } from '../../vr-tests/story-declarations';

export default {
  description: 'File upload idle state',
  story: createStoryReference(stories, 'Idle'),
} satisfies StoryTest;
