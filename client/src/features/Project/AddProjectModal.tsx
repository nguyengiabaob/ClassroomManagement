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
  status: ProjectStatus;
  progress: number;
  budget: number;
  teamSize: number;
  image?: string;
};

type AddProjectModalProps = {
  open: boolean;
  existingIds: string[];
  onCancel: () => void;
  onCreate: (values: NewProjectValues) => void;
};

export default function AddProjectModal({
  open,
  existingIds,
  onCancel,
  onCreate,
}: AddProjectModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<ProjectStatus>("Lập kế hoạch");
  const [idError, setIdError] = useState("");

  const closeModal = () => {
    formRef.current?.reset();
    setStatus("Lập kế hoạch");
    setIdError("");
    onCancel();
  };

  const submitProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = String(data.get("id") ?? "")
      .trim()
      .toUpperCase();

    if (existingIds.includes(id)) {
      setIdError("Mã dự án đã tồn tại");
      return;
    }

    onCreate({
      id,
      name: String(data.get("name") ?? "").trim(),
      location: String(data.get("location") ?? "").trim(),
      status,
      progress: Number(data.get("progress")),
      budget: Number(data.get("budget")),
      teamSize: Number(data.get("teamSize")),
      image: String(data.get("image") ?? "").trim() || undefined,
    });
    formRef?.current?.reset();
    setStatus("Lập kế hoạch");
    setIdError("");
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && closeModal()}>
      <DialogContent className="add-project-dialog max-h-[calc(100vh-2rem)] max-w-[900px] overflow-y-auto p-0">
        <DialogHeader className="add-project-dialog__header">
          <span>
            <Building2 size={23} />
          </span>
          <div>
            <DialogTitle>Khởi tạo dự án mới</DialogTitle>
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="project-name">Tên dự án</Label>
              <div className="add-project-dialog__input">
                <Building2 size={17} />
                <Input
                  id="project-name"
                  name="name"
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
                onValueChange={(value) => setStatus(value as ProjectStatus)}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                  defaultValue={0}
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
                  min={1}
                  defaultValue={1}
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
                type="url"
                placeholder="https://example.com/project.jpg"
              />
            </div>
          </div>

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
              Tạo dự án
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
