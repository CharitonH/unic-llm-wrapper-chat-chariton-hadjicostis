import Chat from "./components/Chat";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Main Content Section */}
      <main className="flex-1 flex items-center justify-center">
        <Chat />
      </main>
    </div>
  );
}