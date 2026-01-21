import { QueryRunner } from 'typeorm';
import { BaseSeed } from './seed.interface';

interface QuestionRow {
  id: number;
  title: string;
}

interface SolutionData {
  question_id: number;
  reference_source: string;
  standard_definition: string;
  technical_mechanism: {
    basicPrinciple: string;
    deepPrinciple: string;
  };
  key_terminology: string[];
  common_misconceptions: string;
  practical_application: string;
}

export class QuestionSolutionSeed extends BaseSeed {
  name = 'QuestionSolutionSeed';
  environment: 'development' | 'production' | 'both' = 'development';

  async run(queryRunner: QueryRunner): Promise<void> {
    // 1. 이미 데이터가 있으면 날리고 새로 시작
    await queryRunner.query(`DELETE FROM question_solutions`);

    // 2. Question ID 조회
    const questions = (await queryRunner.query(`
      SELECT id, title FROM questions;
    `)) as QuestionRow[];

    const getQuestionId = (title: string): number | undefined =>
      questions.find((q) => q.title === title)?.id;

    const osId = getQuestionId('작업 실행 단위의 이해');
    const browserId = getQuestionId('웹 페이지 로딩의 여정');

    const solutions: SolutionData[] = [];

    if (osId) {
      solutions.push({
        question_id: osId,
        reference_source:
          'IEEE Std 1003.1-2017 (POSIX.1) - System Interfaces & General Concepts - https://pubs.opengroup.org/onlinepubs/9699919799/',
        standard_definition:
          "프로세스(Process)는 운영체제로부터 자원을 할당받는 '작업의 단위'이며, 스레드(Thread)는 프로세스 내에서 실행되는 '흐름의 단위'이자 CPU 스케줄링의 기본 단위입니다.",
        technical_mechanism: {
          basicPrinciple:
            '프로세스는 독립된 메모리 영역(Code, Data, Heap, Stack)을 할당받아 서로 간섭하지 않습니다. 반면, 스레드는 프로세스 내에서 Code, Data, Heap 영역을 공유하고, 각자의 Stack과 PC(Program Counter) 레지스터만 독립적으로 가집니다. 이로 인해 멀티 스레드는 데이터 공유가 쉽고 생성 비용이 적지만, 동기화 문제가 발생할 수 있습니다.',
          deepPrinciple:
            "핵심 차이는 'Context Switching(문맥 교환)' 비용에 있습니다. 프로세스 교환 시에는 CPU 캐시를 비우고 TLB(Translation Lookaside Buffer)를 초기화하는 등 무거운 작업이 수반되어 오버헤드가 큽니다. 반면 스레드 교환은 주소 공간(Address Space)이 동일하므로 캐시 적중률(Cache Hit)이 유지되고 TLB를 비울 필요가 없어 훨씬 빠릅니다. 멀티 프로세스는 IPC(Inter-Process Communication)를 통해 통신해야 하므로 복잡하지만, 하나의 프로세스가 죽어도 다른 프로세스에 영향을 주지 않아 안정성이 높습니다.",
        },
        key_terminology: [
          'PCB (Process Control Block) vs TCB (Thread Control Block)',
          'Context Switching Overhead',
          'IPC (Inter-Process Communication)',
          'Shared Memory vs Isolated Memory',
          'Synchronization (Mutex, Semaphore)',
          'Race Condition & Deadlock',
          'TLB (Translation Lookaside Buffer)',
        ],
        common_misconceptions:
          "지원자들이 흔히 범하는 오개념은 '스레드가 많을수록 무조건 성능이 좋아진다'는 것입니다. 스레드가 CPU 코어 수보다 과도하게 많으면 Context Switching 비용이 실제 작업 시간보다 커지는 'Thrashing'이 발생할 수 있습니다. 또한, Python이나 Node.js 같은 언어 환경에서는 GIL(Global Interpreter Lock)로 인해 멀티 스레드를 써도 CPU 바운드 작업에서 병렬 처리가 되지 않는다는 점을 간과하는 경우가 많습니다.",
        practical_application:
          "Google Chrome 브라우저는 대표적인 '멀티 프로세스' 아키텍처 사례입니다. 탭마다 별도 프로세스를 생성하여, 특정 탭이 렌더링 중 충돌(Crash)하더라도 전체 브라우저가 종료되지 않도록 격리(Isolation)하여 안정성을 확보했습니다. 반면, 고성능 웹 서버(Nginx 등)나 대용량 데이터 처리 애플리케이션은 자원 효율성을 위해 '멀티 스레드' 또는 '비동기 이벤트 기반' 모델을 주로 사용합니다.",
      });
    }

    if (browserId) {
      solutions.push({
        question_id: browserId,
        reference_source:
          'W3C HTML Standard (Parsing & Rendering) - https://html.spec.whatwg.org/multipage/parsing.html, IETF RFC 9110 (HTTP Semantics) - https://www.rfc-editor.org/rfc/rfc9110.html',
        standard_definition:
          '사용자의 요청이 DNS를 통해 IP 주소로 변환되고, TCP/TLS 연결을 통해 서버로부터 리소스(HTML, CSS, JS)를 받아온 후, 브라우저 엔진이 이를 파싱하여 렌더 트리(Render Tree)를 구성하고 화면에 픽셀을 그리는(Painting) 일련의 과정입니다.',
        technical_mechanism: {
          basicPrinciple:
            "크게 '네트워크 단계'와 '렌더링 단계'로 나뉩니다. 네트워크 단계에서는 DNS 서버를 통해 도메인의 IP를 찾고, 서버와 연결(3-way Handshake)을 맺어 HTML 문서를 받아옵니다. 렌더링 단계에서는 브라우저가 HTML을 파싱해 DOM 트리를, CSS를 파싱해 CSSOM 트리를 만듭니다. 이 둘을 합쳐 렌더 트리를 만들고, 각 요소의 위치를 계산(Layout)한 뒤 화면에 그립니다(Paint).",
          deepPrinciple:
            '심화 과정은 성능 최적화와 밀접합니다. \n1. 네트워크: 브라우저/OS 캐시 확인 후 Recursive DNS Query가 수행됩니다. HTTPS의 경우 TLS 1.3 Handshake가 추가되며, HTTP/3(QUIC)를 쓴다면 UDP 기반 연결이 일어납니다. \n2. 렌더링(Critical Rendering Path): HTML 파싱 중 `<script>`를 만나면 파싱이 중단(Block)되므로 `async`/`defer` 속성이 중요합니다. 렌더 트리는 `display: none` 요소를 제외하며, 이후 Layout(Reflow) 단계에서 뷰포트 내 정확한 위치와 크기를 계산합니다. 마지막으로 Paint 단계에서 픽셀을 채우고, Composite 단계에서 GPU를 활용해 레이어를 합성하여 최종 화면을 출력합니다.',
        },
        key_terminology: [
          'DNS Lookup (Recursive Query)',
          'TCP 3-way Handshake & TLS Handshake',
          'TTFB (Time To First Byte)',
          'DOM (Document Object Model) & CSSOM',
          'Critical Rendering Path (CRP)',
          'Reflow (Layout) & Repaint',
          'Composite Layer',
        ],
        common_misconceptions:
          "가장 흔한 오개념은 'DOM 트리와 렌더 트리가 1:1로 대응된다'고 생각하는 것입니다. `display: none` 속성이 적용된 노드는 DOM에는 존재하지만 렌더 트리에서는 제외됩니다(반면 `visibility: hidden`은 공간을 차지하므로 렌더 트리에 포함됨). 또한, '화면 업데이트 시 항상 Layout과 Paint가 다시 일어난다'고 착각하지만, `transform`이나 `opacity` 같은 속성만 변경할 경우 Layout/Paint를 건너뛰고 Composite 단계만 수행되어 성능이 훨씬 효율적입니다.",
        practical_application:
          "이 지식은 '웹 성능 최적화'의 핵심입니다. \n1. 네트워크 최적화: CDN 사용, 리소스 압축(Gzip/Brotli), HTTP/2 Multiplexing 활용. \n2. 렌더링 최적화: Reflow를 유발하는 속성(top, left, width 등) 대신 GPU 가속을 사용하는 속성(transform, translate) 사용 권장. \n3. Core Web Vitals: LCP(최대 콘텐츠 렌더링 시간)와 CLS(누적 레이아웃 이동) 지표 개선을 위해 중요 리소스 미리 로드(Preload) 및 이미지 사이즈 명시.",
      });
    }

    if (solutions.length === 0) {
      console.log('No matching questions found for solutions, skipping...');
      return;
    }

    // 4. SQL 생성 및 실행
    const valuesQuery = solutions
      .map((sol) => {
        const techJson = JSON.stringify(sol.technical_mechanism).replace(
          /'/g,
          "''",
        );
        const keysJson = JSON.stringify(sol.key_terminology).replace(
          /'/g,
          "''",
        );
        const desc = sol.standard_definition.replace(/'/g, "''");
        const app = sol.practical_application.replace(/'/g, "''");
        const miss = sol.common_misconceptions.replace(/'/g, "''");
        const ref = sol.reference_source.replace(/'/g, "''");

        return `(
          ${sol.question_id},
          '${ref}',
          '${desc}',
          '${techJson}',
          '${keysJson}',
          '${app}',
          '${miss}'
        )`;
      })
      .join(',');

    await queryRunner.query(`
      INSERT INTO question_solutions (
        question_id,
        reference_source,
        standard_definition,
        technical_mechanism,
        key_terminology,
        practical_application,
        common_misconceptions
      )
      VALUES ${valuesQuery};
    `);

    console.log(
      `✅ Seeded ${solutions.length} question_solutions successfully.`,
    );
  }
}
