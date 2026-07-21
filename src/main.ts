import './style.css';

// import { AvailableCodec, AvailableFormat, RecordingOptions } from './types/record';
import {
  CanvasSource,
  Mp4OutputFormat,
  Output,
  StreamTarget,
  WebMOutputFormat,
} from 'mediabunny';

type State = 'no-folder-selected' | 'ready' | 'recording' | 'finished';
type AvailableContext = '2d' | 'webgl' | 'webgpu';

const fps = 60;
const recordingDuration = 5; // 5sec

let state: State = 'no-folder-selected';
let frame: number = 0;

let output: Output;
let videoSource: CanvasSource;

let handle: FileSystemFileHandle;
let writableStream: WritableStream;

const contextSelected: AvailableContext = (document.querySelector<HTMLSelectElement>('#canvas-select')?.value ?? '2d') as AvailableContext
document.querySelector<HTMLButtonElement>('button#select-folder')?.addEventListener('click', selectFolderDialog);
document.querySelector<HTMLButtonElement>('button#start-recording')?.addEventListener('click', async () => {
  try {
    await startRecording( contextSelected )
  } catch (e) {
    console.error(e)
  }
});


async function selectFolderDialog(): Promise<void> {
  try {
    handle = await window.showSaveFilePicker();
    writableStream = await handle.createWritable();
    state = 'ready';
    console.log(handle, writableStream)
  } catch (error) {}
}


async function startRecording(contextString: AvailableContext) {
  if(state !== 'ready')
    throw new Error('Select a folder first or wait for the current recording to stop');

  const canvas = document.getElementsByClassName(contextString)[0] as HTMLCanvasElement;
  if(!canvas)
    throw new Error('No Canvas');

  output = new Output({
    format: new Mp4OutputFormat(),
    target: new StreamTarget(writableStream, {
      chunked: true,
      chunkSize: 2 ** 16
    })
  });

  videoSource = new CanvasSource(canvas, {
    codec: 'av1',
    bitrate: 1e6 * 60, // 60 Mbps
    // alpha: 'keep'
    // hardwareAcceleration: 'prefer-hardware',
  });

  output.addVideoTrack(videoSource, { frameRate: 60 });

  output.setMetadataTags({
    title: `${contextString}_${new Date().toISOString().replace(/T|Z|:/g, '_').slice(0, -5)}`,
    date: new Date(),
  });

  state = 'recording';
  await output.start();
  // await this.createFile();

  captureCanvasFrames()
}

async function captureCanvasFrames() {
  if (!output || !videoSource)
    throw new Error('No output or videoSource specified. Please start a recording first.')

  frame = 0; //Reset Frame Count

  const captureFrame = async () => {
    try {
      console.log(frame)
      await wait(1 / fps);
      await videoSource.add(frame / fps, 1 / fps, { keyFrame: frame % 60 === 0 })

    } catch (error) {
      throw new Error('An error ocured during captureFrame()' + error)
    }
  }

  
  const totalFrameCount = recordingDuration * fps;
  for (frame; frame < totalFrameCount; frame++) await captureFrame();
  stopRecording();
}

async function stopRecording() {
  if (!output)
    throw new Error('No output specified. Please start a recording first.')

  state = 'finished';
  await output.finalize();
  
  console.log(output.target);
}


async function wait(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}