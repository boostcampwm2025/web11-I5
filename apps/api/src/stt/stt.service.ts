import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AudioAsset } from 'src/audio-stream/entities/audio-asset.entity';

@Injectable()
export class SttService {
  private readonly logger = new Logger(SttService.name);
  private ncpSpeechInvokeUrl?: string;
  private ncpSpeechSecretKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.ncpSpeechInvokeUrl = this.configService.get<string>(
      'NCLOUD_CLOVA_SPEECH_INVOKE_URL',
    );
    this.ncpSpeechSecretKey = this.configService.get<string>(
      'NCLOUD_CLOVA_SPEECH_SECRET_KEY',
    );
  }

  /**
   * stt를 비동기로 요청합니다. 결과는 Object Storage에 저장됩니다.
   */
  requestStt(audioAsset: AudioAsset) {
    const requestUrl = `${this.ncpSpeechInvokeUrl}/recognizer/object-storage`;
    const callbackBaseUrl = this.configService.get<string>('STT_CALLBACK_URL');
    const params = {
      dataKey: audioAsset.objectKey,
      language: 'ko-KR',
      completion: 'async',
      callback: `${callbackBaseUrl}/stt/callback?audioAssetId=${audioAsset.id}`,
      boostings: [
        {
          // TODO: 키워드 부스팅 단어들을 문제별로 다르게 주어야합니다.
          words:
            '리엑트,컴포넌트,훅,유즈스테이트,유즈이펙트,가상돔,제이에스엑스,렌더링,싱글페이지애플리케이션,라우터,노드제이에스,비동기,프로미스,이벤트루프,스레드,프로세스,메모리,캐시,가비지컬렉션,커널,파일시스템,스택,큐,덱,링크드리스트,배열,해시테이블,셋,맵,트리,이진트리,이진탐색트리,힙,우선순위큐,그래프,깊이우선탐색,너비우선탐색,이진탐색,정렬,버블정렬,선택정렬,삽입정렬,퀵정렬,병합정렬,다이나믹프로그래밍,그리디,분할정복,시간복잡도,공간복잡도,디엔에스,도메인이름해결,아이피주소,티씨피,쓰리웨이핸드셰이크,에이치티티피,에이치티티피에스,티엘에스,요청헤더,요청바디,응답헤더,응답바디,상태코드,리다이렉트,패킷,라우팅,네트워크지연,대역폭,혼잡제어,브라우저캐시,디스크캐시,프리플라이트요청,씨오아르에스,파싱,에이치티엠엘파서,씨에스에스파서,돔트리,씨에스에스오엠,렌더트리,레이아웃,리플로우,리페인트,컴포지팅,지피유가속,자바스크립트엔진,싱글스레드모델,메인스레드,렌더링엔진,워커스레드,웹워커,멀티태스킹,병렬실행,주소공간분리,자원공유,컨텍스트스위칭비용,인터프로세스커뮤니케이션,아이피씨,공유메모리모델,락기반동기화,경쟁상태,임계구역,장애격리,확장전략,안정성보장,트라이,유니온파인드,서로소집합,최소신장트리,크루스칼,프림,최단경로,다익스트라,벨만포드,플로이드워셜,위상정렬,강한결합요소,코사라주,타잔,백트래킹,브루트포스,슬라이딩윈도우,투포인터,누적합,차분배열,비트마스킹,분기한정,아모타이즈드분석',
        },
      ],
    };

    const sanitizedParams = {
      language: params.language,
      completion: params.completion,
      boostings: params.boostings,
    };
    this.logger.log(
      `STT requested with params: ${JSON.stringify(sanitizedParams)}`,
    );

    return fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CLOVASPEECH-API-KEY': this.ncpSpeechSecretKey ?? '',
      },
      body: JSON.stringify(params),
    });
  }
}
