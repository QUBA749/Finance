export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-4 lg:px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} FinanceAI. All rights reserved.</p>
        <p>v1.0.0 · Built with care</p>
      </div>
    </footer>
  );
}