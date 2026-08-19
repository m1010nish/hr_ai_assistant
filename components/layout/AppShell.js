import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

/*
| Header across the top, fixed navigation rail on the left, content fills the
| rest. The shell owns the viewport height so pages that need their own
| internal scrolling (the assistant) can rely on a bounded parent.
*/
export default function AppShell({ children }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <Header />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-line bg-surface lg:block">
          <Sidebar />
        </aside>

        <main id="main-content" className="min-w-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
