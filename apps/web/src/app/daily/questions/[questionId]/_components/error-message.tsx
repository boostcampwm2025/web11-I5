interface ErrorMessageProps {
  message: string | null;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return <p className="text-red-500 text-center text-sm mt-2">{message}</p>;
}

export { ErrorMessage };
