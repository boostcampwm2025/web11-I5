import { TableCell, TableRow } from "@/components/table/table";

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
        아직 제출된 답변이 없습니다.
      </TableCell>
    </TableRow>
  );
}

export { EmptyState };
