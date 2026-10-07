import { type FormEvent } from "react"
import { Mail, Phone, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { userInforamation } from "../features/dashboard/InstructorService"

interface ModalAddingStudentProps {
  dataUpdate?: userInforamation | unknown
  isModalOpen: boolean
  handleCancel: () => void
  onFinishAddStudent: (value: userInforamation) => void
}

export default function ModalAddingStudent({
  dataUpdate,
  isModalOpen,
  handleCancel,
  onFinishAddStudent,
}: ModalAddingStudentProps) {
  const student = (dataUpdate ?? {}) as Partial<userInforamation>

  const submitStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    onFinishAddStudent({
      id: String(data.get("id") ?? ""),
      fullName: String(data.get("fullName") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
    })
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-[600px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Student</DialogTitle>
          <DialogDescription>Enter the student&apos;s contact information.</DialogDescription>
        </DialogHeader>

        <form key={`${student.id ?? "new"}-${isModalOpen}`} className="mt-5 grid gap-5" onSubmit={submitStudent}>
          <input type="hidden" name="id" defaultValue={student.id} />
          <div className="grid gap-2">
            <Label htmlFor="student-name">Full Name</Label>
            <div className="relative">
              <UserRound className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input id="student-name" name="fullName" defaultValue={student.fullName} placeholder="Full name" className="h-11 pl-10" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="student-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input id="student-email" name="email" type="email" defaultValue={student.email} placeholder="robert@example.com" className="h-11 pl-10" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input id="student-phone" name="phone" type="tel" defaultValue={student.phone} placeholder="+1 (555) 000-0000" className="h-11 pl-10" required />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-5">
            <Button type="button" variant="outline" size="lg" onClick={handleCancel}>Cancel</Button>
            <Button type="submit" size="lg">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
