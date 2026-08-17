import * as stories from './FileUpload.stories';
import { createStoryReference, type StoryTest } from '../../vr-tests/story-declarations';

export default {
  description: 'File upload requesting URL state',
  story: createStoryReference(stories, 'RequestingUrl'),
} satisfies StoryTest;
