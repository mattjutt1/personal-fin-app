export default async function Home() {
  let message = "Loading...";
  try {
    const response = await fetch("http://localhost:8000/");
    const data = await response.json();
    message = data.message;
  } catch (error) {
    console.error("Error fetching message:", error);
    message = "Failed to load message from backend.";
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">{message}</h1>
    </main>
  );
}

