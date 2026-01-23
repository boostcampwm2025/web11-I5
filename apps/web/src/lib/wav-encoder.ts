/**
 * WAV 파일 인코딩 유틸리티
 * PCM16 데이터를 WAV 형식으로 변환
 */

/**
 * PCM16 청크들을 WAV 파일로 인코딩
 * @param pcmChunks PCM 데이터 청크 배열
 * @param sampleRate 샘플 레이트 (예: 16000)
 * @param channels 채널 수 (예: 1)
 * @returns WAV 파일 Blob
 */
export function encodePcmToWav(
  pcmChunks: ArrayBuffer[],
  sampleRate: number,
  channels: number,
): Blob {
  // PCM 데이터 합치기
  const totalLength = pcmChunks.reduce(
    (sum, chunk) => sum + chunk.byteLength,
    0,
  );
  const pcmData = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of pcmChunks) {
    pcmData.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }

  // WAV 헤더 생성 (44 bytes)
  const header = createWavHeader(sampleRate, channels, pcmData.length);

  // WAV 파일 조합
  const wavData = new Uint8Array(header.length + pcmData.length);
  wavData.set(header, 0);
  wavData.set(pcmData, header.length);

  return new Blob([wavData], { type: "audio/wav" });
}

/**
 * WAV 파일 헤더 생성
 * PCM16 포맷 기준 (16-bit signed integer, little-endian)
 */
function createWavHeader(
  sampleRate: number,
  channels: number,
  dataSize: number,
): Uint8Array {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF chunk descriptor
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true); // ChunkSize
  writeString(view, 8, "WAVE");

  // fmt sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, channels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * channels * 2, true); // ByteRate
  view.setUint16(32, channels * 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true); // Subchunk2Size

  return new Uint8Array(header);
}

/**
 * DataView에 문자열 쓰기
 */
function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
