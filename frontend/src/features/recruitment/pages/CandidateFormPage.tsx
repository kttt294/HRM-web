import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../shared/constants/routes';

export function CandidateFormPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    vacancyId: '',
    resumeUrl: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting candidate:', formData);
    // TODO: Call API to save candidate
    navigate(ROUTES.CANDIDATES);
  };

  const handleReset = () => {
    navigate(ROUTES.CANDIDATES);
  };

  return (
    <>
      <header>
        <h1>THÊM ỨNG VIÊN MỚI</h1>
      </header>

      <main>
        <form id="candidate-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <h2>Thông tin cá nhân</h2>
            
            <Input
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />

            <Input
              type="email"
              label="Email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </section>

          <section className="form-section">
            <h2>Thông tin ứng tuyển</h2>

            <Select
              label="Vị trí ứng tuyển"
              name="vacancyId"
              options={[
                { value: '1', label: 'Lập trình viên Frontend' },
                { value: '2', label: 'Lập trình viên Backend' },
                { value: '3', label: 'Nhân viên Kinh doanh' },
              ]}
              placeholder="Chọn vị trí"
              value={formData.vacancyId}
              onChange={(e) => setFormData({ ...formData, vacancyId: e.target.value })}
            />

            <Input
              label="Link CV"
              name="resumeUrl"
              value={formData.resumeUrl}
              onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
              placeholder="https://..."
            />

            <Input
              label="Ghi chú"
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </section>

          <div className="form-actions">
            <Button type="submit">Lưu ứng viên</Button>
            <Button type="button" variant="secondary" onClick={handleReset}>
              Hủy
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
