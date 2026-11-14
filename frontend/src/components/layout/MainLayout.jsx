export default function MainLayout({ sidebar, children }) {
  return (
    <div className="app-layout">
      <aside className="sidebar-slot">{sidebar}</aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
