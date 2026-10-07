import { type FormEvent, useState } from "react"
import { LockKeyhole, ShieldCheck } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { setPassword } from "../login/loginService"

export default function SetupPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSetupPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const password = String(data.get("password") ?? "")
    const confirmation = String(data.get("confirm") ?? "")

    if (password !== confirmation) {
      toast.error("Passwords do not match!")
      return
    }

    setLoading(true)
    try {
      const result = await setPassword(searchParams.get("token") ?? "", password)
      if (result.status !== 200) {
        toast.error(result.data?.message || "Unable to set your password.")
        return
      }
      toast.success("Account setup successful! You can now log in.")
      navigate("/login")
    } catch {
      toast.error("Unable to set your password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg gap-5 py-7">
        <CardHeader>
          <CardTitle className="text-2xl">Set up your password</CardTitle>
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-slate-600">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-blue-600" />
            This is a secure page for creating your credentials after email verification.
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={handleSetupPassword}>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <LockKeyhole className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input id="new-password" name="password" type="password" minLength={6} placeholder="Min 6 characters" className="h-11 pl-10" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <LockKeyhole className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input id="confirm-password" name="confirm" type="password" minLength={6} placeholder="Repeat password" className="h-11 pl-10" required />
              </div>
            </div>
            <Button type="submit" size="lg" className="h-12 bg-indigo-600 font-bold hover:bg-indigo-700" disabled={loading}>
              {loading && <Spinner />}
              Complete Setup & Save
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
