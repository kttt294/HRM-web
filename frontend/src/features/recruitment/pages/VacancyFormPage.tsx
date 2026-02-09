import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../shared/constants/routes';

export function VacancyFormPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    requirements: '',
    numberOfPositions: 1,
    minSalary: '',
    maxSalary: '',
    deadline: '',
    status: 'open',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting vacancy:', formData);
    // TODO: Call API to save vacancy
    navigate(ROUTES.VACANCIES);
  };

  const handleReset = () => {
    navigate(ROUTES.VACANCIES);
  };

  return (
    <>
      <header>
        <h1>THÊM VỊ TRÍ TUYỂN DỤNG MỚI</h1>
      </header>

      <main>
        <form id="vacancy-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <h2>Thông tin vị trí</h2>
            
            <Input
              label="Tên vị trí"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <Select
              label="Phòng ban"
              name="department"
              options={[
                { value: 'it', label: 'Phòng IT' },
                { value: 'hr', label: 'Phòng Nhân sự' },
                { value: 'sales', label: 'Phòng Kinh doanh' },
                { value: 'marketing', label: 'Phòng Marketing' },
                { value: 'finance', label: 'Phòng Tài chính' },
              ]}
              placeholder="Chọn phòng ban"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />

            <Input
              label="Mô tả công việc"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Input
              label="Yêu cầu"
              name="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            />
          </section>

          <section className="form-section">
            <h2>Thông tin tuyển dụng</h2>

            <Input
              type="number"
              label="Số lượng cần tuyển"
              name="numberOfPositions"
              value={String(formData.numberOfPositions)}
              onChange={(e) => setFormData({ ...formData, numberOfPositions: Number(e.target.value) })}
              min={1}
            />

            <Input
              type="number"
              label="Lương tối thiểu (VNĐ)"
              name="minSalary"
              value={formData.minSalary}
              onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
            />

            <Input
              type="number"
              label="Lương tối đa (VNĐ)"
              name="maxSalary"
              value={formData.maxSalary}
              onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
            />

            <Input
              type="date"
              label="Hạn nộp hồ sơ"
              name="deadline"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />

            <Select
              label="Trạng thái"
              name="status"
              options={[
                { value: 'open', label: 'Đang tuyển' },
                { value: 'closed', label: 'Đã đóng' },
                { value: 'draft', label: 'Nháp' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
          </section>

          <div className="form-actions">
            <Button type="submit">Lưu vị trí</Button>
            <Button type="button" variant="secondary" onClick={handleReset}>
              Hủy
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
