// Layout protégé — la vérification auth est dans middleware.ts
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div>{children}</div>
}
