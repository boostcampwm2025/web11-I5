import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/pagination/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  buildUrl: (page: number) => string;
}

function PaginationControls({
  currentPage,
  totalPages,
  buildUrl,
}: PaginationControlsProps) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={buildUrl(isFirstPage ? currentPage : currentPage - 1)}
            className={isFirstPage ? "pointer-events-none opacity-50" : ""}
            aria-disabled={isFirstPage}
            tabIndex={isFirstPage ? -1 : undefined}
          />
        </PaginationItem>

        <PaginationItem>
          <div
            className="px-2"
            aria-label={`현재 ${currentPage}페이지, 전체 ${totalPages}페이지`}
          >
            {currentPage} / {totalPages}
          </div>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            href={buildUrl(isLastPage ? currentPage : currentPage + 1)}
            className={isLastPage ? "pointer-events-none opacity-50" : ""}
            aria-disabled={isLastPage}
            tabIndex={isLastPage ? -1 : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export { PaginationControls };
