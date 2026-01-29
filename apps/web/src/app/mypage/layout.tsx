function MyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full flex justify-center overflow-x-hidden">
      {children}
    </section>
  );
}
export default MyPageLayout;
