

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="h-screen w-full bg-white dark:bg-[#191A1A] dark:text-white">
    {children}</div>
} 