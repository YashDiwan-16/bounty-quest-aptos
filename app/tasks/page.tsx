import PastTask from "@/components/PastTask";
import TaskDashboard from "@/components/TaskDashboard";

export default function TasksPage() {

  return (
    <main className={`min-h-screen py-12 transition-all duration-200`}>
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">
          Crypto Twitter Challenge
        </h1>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold">
            Today&apos;s Tasks
          </h2>
          <TaskDashboard />
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-semibold">
            Previous Tasks History
          </h2>
          <PastTask />
        </div>
      </div>
    </main>
  );
}
