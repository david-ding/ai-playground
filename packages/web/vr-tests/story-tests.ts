import type { StoryTest } from './story-declarations';
import idle from '../src/components/FileUpload.idle.vr-test';
import requestingUrl from '../src/components/FileUpload.requesting-url.vr-test';
import uploading from '../src/components/FileUpload.uploading.vr-test';
import done from '../src/components/FileUpload.done.vr-test';
import error from '../src/components/FileUpload.error.vr-test';

export const storyTests: StoryTest[] = [idle, requestingUrl, uploading, done, error];
