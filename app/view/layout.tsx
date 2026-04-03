export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No Navbar, no global layout — standalone viewer
  return <>{children}</>;
}
