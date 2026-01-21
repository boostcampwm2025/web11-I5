function MyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-screen h-screen flex justify-center">
      {children}
    </section>
  );
}
export default MyPageLayout;
