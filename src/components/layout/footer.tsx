interface Props {
  message?: string;
  copyright?: string;
}

export default function Footer({ message, copyright }: Props) {
  const year = new Date().getFullYear();
  const resolvedCopyright = copyright?.replace("{year}", String(year));

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400 space-y-1">
        {message && <p>{message}</p>}
        {resolvedCopyright && <p>{resolvedCopyright}</p>}
      </div>
    </footer>
  );
}
