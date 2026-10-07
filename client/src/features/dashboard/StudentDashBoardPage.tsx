import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { useSelector } from "react-redux"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { RootState } from "../../redux/store"

const initialLessons = [
  { id: 1, title: "React Basics", date: "Oct 25, 2023", status: "pending", desc: "Introduction to Components, Props, and State." },
  { id: 2, title: "Shadcn UI Mastery", date: "Oct 26, 2023", status: "done", desc: "Building accessible layouts, cards, and forms." },
  { id: 3, title: "Firebase Integration", date: "Oct 27, 2023", status: "pending", desc: "Auth, Firestore, and Deployment." },
]

export default function StudentDashBoardPage() {
  const user = useSelector((state: RootState) => state.users)
  const [lessons, setLessons] = useState(initialLessons)

  const completeLesson = (id: number) => {
    setLessons((current) => current.map((lesson) => lesson.id === id ? { ...lesson, status: "done" } : lesson))
    toast.success("Lesson marked as done!")
  }

  return (
    <div className="max-w-8xl mx-auto space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg">
        <h1 className="text-2xl font-semibold">Welcome back, {user?.name}!</h1>
        <p className="mt-2 text-white/80">You have lessons to complete today.</p>
      </div>

      <h2 className="pt-2 text-xl font-semibold">Your Assigned Lessons</h2>
      <div className="grid gap-4">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className={`border-l-4 py-0 shadow-sm ${lesson.status === "done" ? "border-l-green-500" : "border-l-blue-500"}`}>
            <CardContent className="flex items-center justify-between gap-5 p-6">
              <div>
                <p className="text-xs tracking-wider text-slate-500 uppercase">{lesson.date}</p>
                <h3 className="my-1 font-semibold">{lesson.title}</h3>
                <p className="text-sm text-slate-500 italic">{lesson.desc}</p>
              </div>
              {lesson.status === "done" ? (
                <Badge className="gap-1 border-green-200 bg-green-50 text-green-700"><CheckCircle2 /> Completed</Badge>
              ) : (
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700" onClick={() => completeLesson(lesson.id)}>Mark as Done</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
