function MyPageLayout({ children }: { children: React.ReactNode }) {
  return <section className="w-screen flex justify-center">{children}</section>;
}
export default MyPageLayout;
