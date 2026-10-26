import { type FormEvent, useRef, useState } from "react";
import { Banknote, Building2, Hash, Image, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ProjectStatus = "Đang thi công" | "Lập kế hoạch" | "Hoàn thành";

export type NewProjectValues = {
  id: string;
  name: string;
  location: string;
  status: string;
  progress: number;
  budget: number;
  teamSize: number;
  image?: string;
};

type AddProjectModalProps = {
  open: boolean;
  existingIds: string[];
  onCancel: () => void;
  onCreate: (values: NewProjectValues) => void | Promise<boolean | void>;
  initialValues?: NewProjectValues;
  mode?: "create" | "edit";
};

export default function AddProjectModal({
  open,
  existingIds,
  onCancel,
  onCreate,
  initialValues,
  mode = "create",
}: AddProjectModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState(initialValues?.status ?? "Lập kế hoạch");
  const [idError, setIdError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const closeModal = () => {
    if (isSubmitting) return;
    formRef.current?.reset();
    setStatus(initialValues?.status ?? "Lập kế hoạch");
    setIdError("");
    setSubmitError("");
    onCancel();
  };

  const submitProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const data = new FormData(event.currentTarget);
    const id = String(data.get("id") ?? "")
      .trim()
      .toUpperCase();

    if (existingIds.includes(id) && id !== initialValues?.id) {
      setIdError("Mã dự án đã tồn tại");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const result = await onCreate({
        id,
        name: String(data.get("name") ?? "").trim(),
        location: String(data.get("location") ?? "").trim(),
        status,
        progress: Number(data.get("progress")),
        budget: Number(data.get("budget")),
        teamSize: Number(data.get("teamSize")),
        image: String(data.get("image") ?? "").trim() || undefined,
      });
      if (result === false) return;
      formRef?.current?.reset();
      setStatus(initialValues?.status ?? "Lập kế hoạch");
      setIdError("");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể lưu dự án. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && closeModal()}>
      <DialogContent className="add-project-dialog max-h-[calc(100vh-2rem)] max-w-[900px] overflow-y-auto p-0">
        <DialogHeader className="add-project-dialog__header">
          <span>
            <Building2 size={23} />
          </span>
          <div>
            <DialogTitle>{mode === "edit" ? "Chỉnh sửa dự án" : "Khởi tạo dự án mới"}</DialogTitle>
            <DialogDescription>
              Nhập thông tin cơ bản để bắt đầu quản lý công trình.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form
          ref={formRef}
          className="add-project-dialog__form"
          onSubmit={submitProject}
        >
          <fieldset disabled={isSubmitting} className="m-0 grid min-w-0 gap-4 border-0 p-0">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="project-name">Tên dự án</Label>
              <div className="add-project-dialog__input">
                <Building2 size={17} />
                <Input
                  id="project-name"
                  name="name"
                  defaultValue={initialValues?.name}
                  maxLength={80}
                  placeholder="VD: Central Park Residence"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-id">Mã dự án</Label>
              <div className="add-project-dialog__input">
                <Hash size={17} />
                <Input
                  id="project-id"
                  name="id"
                  defaultValue={initialValues?.id}
                  pattern="[A-Za-z0-9-]+"
                  placeholder="BF-2026-001"
                  aria-invalid={Boolean(idError)}
                  onInput={(event) => {
                    event.currentTarget.value =
                      event.currentTarget.value.toUpperCase();
                    setIdError("");
                  }}
                  required
                />
              </div>
              {idError && <p className="text-xs text-destructive">{idError}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-location">Địa điểm công trình</Label>
            <div className="add-project-dialog__input">
              <MapPin size={17} />
              <Input
                id="project-location"
                name="location"
                defaultValue={initialValues?.location}
                maxLength={120}
                placeholder="Quận / Thành phố / Tỉnh"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Trạng thái</Label>
              <Select
                value={status}
                disabled={isSubmitting}
                onValueChange={(value) => setStatus(value)}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {!["Lập kế hoạch", "Đang thi công", "Hoàn thành"].includes(status) && <SelectItem value={status}>{status}</SelectItem>}
                  <SelectItem value="Lập kế hoạch">Lập kế hoạch</SelectItem>
                  <SelectItem value="Đang thi công">Đang thi công</SelectItem>
                  <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-progress">Tiến độ hiện tại</Label>
              <div className="add-project-dialog__number">
                <Input
                  id="project-progress"
                  name="progress"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={initialValues?.progress ?? 0}
                  required
                />
                <span>%</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="project-budget">Ngân sách dự kiến</Label>
              <div className="add-project-dialog__input add-project-dialog__number">
                <Banknote size={17} />
                <Input
                  id="project-budget"
                  name="budget"
                  defaultValue={initialValues?.budget}
                  type="number"
                  min={0}
                  placeholder="0"
                  required
                />
                <span>VNĐ</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-team">Nhân lực dự kiến</Label>
              <div className="add-project-dialog__input add-project-dialog__number">
                <Users size={17} />
                <Input
                  id="project-team"
                  name="teamSize"
                  type="number"
                  min={0}
                  defaultValue={initialValues?.teamSize ?? 1}
                  required
                />
                <span>người</span>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-image">Ảnh dự án (không bắt buộc)</Label>
            <div className="add-project-dialog__input">
              <Image size={17} />
              <Input
                id="project-image"
                name="image"
                defaultValue={initialValues?.image}
                type="url"
                placeholder="https://example.com/project.jpg"
              />
            </div>
          </div>

          {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
          <DialogFooter className="add-project-dialog__actions">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={closeModal}
            >
              Hủy
            </Button>
            <Button type="submit" size="lg">
              {isSubmitting ? "Đang lưu..." : mode === "edit" ? "Lưu thay đổi" : "Tạo dự án"}
            </Button>
          </DialogFooter>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
