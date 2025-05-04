import { MainLayout } from "@/components/layout/MainLayout";
import { StudyPlanner } from "@/components/study-planner/StudyPlanner";

export default function StudyPlannerPage() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <StudyPlanner />
      </div>
    </MainLayout>
  );
}