import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbarStore } from '../../../store/snackbar.store';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../shared/constants/routes';

export function CandidateFormPage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbarStore();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    vacancyId: '',
    resumeUrl: '',
    notes: '',
  });
  const [vacancies, setVacancies] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/recruitment/vacancies')
      .then(res => res.json())
      .then(data => setVacancies(data))
      .catch(err => console.error('Failed to fetch vacancies:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/recruitment/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          vacancyId: formData.vacancyId ? parseInt(formData.vacancyId) : null,
          resumeUrl: formData.resumeUrl,
          notes: formData.notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create candidate');
      }

      showSnackbar("Thêm ứng viên thành công", "success");
      navigate(ROUTES.CANDIDATES);
    } catch (error) {
      console.error(error);
      showSnackbar("Có lỗi xảy ra khi thêm ứng viên", "error");
    }
  };

  const handleReset = () => {
    navigate(ROUTES.CANDIDATES);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title-section">
          <h1>THÊM ỨNG VIÊN MỚI</h1>
          <p className="page-subtitle">Nhập thông tin ứng viên mới vào danh sách theo dõi tuyển dụng</p>
        </div>
      </div>

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
              options={vacancies.map(v => ({ value: String(v.id), label: v.title }))}
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
