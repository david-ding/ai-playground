import * as stories from './FileUpload.stories';
import { createStoryReference, type StoryTest } from '../../vr-tests/story-declarations';

export default {
  description: 'File upload uploading state',
  story: createStoryReference(stories, 'Uploading'),
} satisfies StoryTest;
