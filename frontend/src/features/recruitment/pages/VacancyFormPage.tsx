import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../shared/constants/routes';
import { recruitmentApi } from '../services/recruitment.api';
import { useSnackbarStore } from '../../../store/snackbar.store';

export function VacancyFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { showSnackbar } = useSnackbarStore();

  const [formData, setFormData] = useState({
    title: '',
    jobTitle: '',
    department: '',
    description: '',
    requirements: '',
    numberOfPositions: 1,
    minSalary: '',
    maxSalary: '',
    deadline: '',
    status: 'open',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      setIsLoading(true);
      recruitmentApi.getVacancyById(id)
        .then((data) => {
          // Format deadline from ISO string to yyyy-mm-dd for HTML date input
          let deadlineValue = '';
          if (data.deadline) {
            try {
              const date = new Date(data.deadline);
              deadlineValue = date.toISOString().split('T')[0];
            } catch (e) {
              console.error('Invalid deadline format:', data.deadline);
            }
          }

          setFormData({
            title: data.title || '',
            jobTitle: data.jobTitle || '',
            department: data.department || '',
            description: data.description || '',
            requirements: Array.isArray(data.requirements) 
              ? data.requirements.join(', ') 
              : (data.requirements || ''),
            numberOfPositions: data.numberOfPositions || 1,
            minSalary: data.minSalary ? String(data.minSalary) : '',
            maxSalary: data.maxSalary ? String(data.maxSalary) : '',
            deadline: deadlineValue,
            status: data.status || 'open',
          });
        })
        .catch((error) => {
          console.error('Failed to load vacancy:', error);
          showSnackbar('Không thể tải thông tin vị trí tuyển dụng', 'error');
          navigate(ROUTES.VACANCIES);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        requirements: formData.requirements
          .split(',')
          .map(req => req.trim())
          .filter(req => req.length > 0),
        numberOfPositions: Number(formData.numberOfPositions),
        minSalary: formData.minSalary ? Number(formData.minSalary) : undefined,
        maxSalary: formData.maxSalary ? Number(formData.maxSalary) : undefined,
        deadline: formData.deadline || undefined,
        status: formData.status as 'open' | 'closed' | 'draft',
      };

      console.log('Submitting vacancy payload:', payload);

      if (isEditMode && id) {
        const result = await recruitmentApi.updateVacancy(id, payload);
        console.log('Update successful:', result);
        showSnackbar('Cập nhật vị trí tuyển dụng thành công!', 'success');
      } else {
        const result = await recruitmentApi.createVacancy(payload);
        console.log('Create successful:', result);
        showSnackbar('Tạo vị trí tuyển dụng thành công!', 'success');
      }
      navigate(ROUTES.VACANCIES);
    } catch (error: any) {
      console.error('Failed to save vacancy:', error);
      const errorMessage = error.message || 'Unknown error';
      showSnackbar(`Không thể ${isEditMode ? 'cập nhật' : 'tạo'} vị trí tuyển dụng\nLỗi: ${errorMessage}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    navigate(ROUTES.VACANCIES);
  };

  if (isLoading) {
    return <div className="loading">Đang tải thông tin vị trí...</div>;
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title-section">
          <h1>{isEditMode ? "CHỈNH SỬA VỊ TRÍ TUYỂN DỤNG" : "THÊM VỊ TRÍ TUYỂN DỤNG MỚI"}</h1>
          <p className="page-subtitle">
            {isEditMode
              ? "Cập nhật thông tin chi tiết cho vị trí đang tuyển dụng"
              : "Tạo tin tuyển dụng mới để thu hút nhân tài cho công ty"}
          </p>
        </div>
      </div>

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

            <Input
              label="Chức danh"
              name="jobTitle"
              placeholder="Nhập chức danh (VD: Senior Developer, Trưởng phòng...)"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />

            <Select
              label="Phòng ban"
              name="department"
              options={[
                { value: 'Công nghệ thông tin', label: 'Công nghệ thông tin' },
                { value: 'Nhân sự', label: 'Nhân sự' },
                { value: 'Kế toán', label: 'Kế toán' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Kinh doanh', label: 'Kinh doanh' },
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Lưu vị trí')}
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset} disabled={isSaving}>
              Hủy
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
