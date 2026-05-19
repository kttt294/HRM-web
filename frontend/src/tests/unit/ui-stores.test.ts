/**
 * Unit Tests: store/snackbar.store.ts & store/ui.store.ts
 *
 * Kiểm tra Zustand UI stores:
 * - SnackbarStore: showSnackbar, hideSnackbar, default values
 * - UIStore: toggleSidebar, setSidebarCollapsed, openModal, closeModal, closeSidebar
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useSnackbarStore } from '../../store/snackbar.store';
import { useUIStore } from '../../store/ui.store';

// ============================================================
// SNACKBAR STORE
// ============================================================
describe('SnackbarStore', () => {
  beforeEach(() => {
    useSnackbarStore.setState({ isOpen: false, message: '', type: 'info', duration: 3000 });
  });

  describe('Trạng thái khởi tạo', () => {
    it('nên có trạng thái đóng khi khởi tạo', () => {
      const state = useSnackbarStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.message).toBe('');
      expect(state.type).toBe('info');
    });
  });

  describe('showSnackbar()', () => {
    it('nên hiển thị snackbar với message và type được truyền vào', () => {
      useSnackbarStore.getState().showSnackbar('Lưu thành công!', 'success');

      const state = useSnackbarStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.message).toBe('Lưu thành công!');
      expect(state.type).toBe('success');
    });

    it('nên dùng type mặc định là "info" nếu không truyền', () => {
      useSnackbarStore.getState().showSnackbar('Thông báo');

      expect(useSnackbarStore.getState().type).toBe('info');
    });

    it('nên dùng duration mặc định là 3000ms nếu không truyền', () => {
      useSnackbarStore.getState().showSnackbar('Test');

      expect(useSnackbarStore.getState().duration).toBe(3000);
    });

    it('nên cho phép truyền duration tuỳ chỉnh', () => {
      useSnackbarStore.getState().showSnackbar('Test', 'warning', 5000);

      expect(useSnackbarStore.getState().duration).toBe(5000);
    });

    it('nên hỗ trợ tất cả các type: success, error, info, warning', () => {
      const types = ['success', 'error', 'info', 'warning'] as const;

      types.forEach(type => {
        useSnackbarStore.getState().showSnackbar('msg', type);
        expect(useSnackbarStore.getState().type).toBe(type);
      });
    });
  });

  describe('hideSnackbar()', () => {
    it('nên đóng snackbar', () => {
      useSnackbarStore.getState().showSnackbar('Test', 'error');
      expect(useSnackbarStore.getState().isOpen).toBe(true);

      useSnackbarStore.getState().hideSnackbar();

      expect(useSnackbarStore.getState().isOpen).toBe(false);
    });

    it('nên giữ nguyên message và type sau khi đóng', () => {
      useSnackbarStore.getState().showSnackbar('Lỗi kết nối', 'error');
      useSnackbarStore.getState().hideSnackbar();

      const state = useSnackbarStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.message).toBe('Lỗi kết nối');
      expect(state.type).toBe('error');
    });
  });
});

// ============================================================
// UI STORE
// ============================================================
describe('UIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarCollapsed: false,
      isSidebarOpen: true,
      modalOpen: null,
    });
  });

  describe('Trạng thái khởi tạo', () => {
    it('nên có sidebar mở và không có modal', () => {
      const state = useUIStore.getState();
      expect(state.isSidebarOpen).toBe(true);
      expect(state.sidebarCollapsed).toBe(false);
      expect(state.modalOpen).toBeNull();
    });
  });

  describe('toggleSidebar()', () => {
    it('nên toggle trạng thái sidebar từ open → close', () => {
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });

    it('nên toggle trạng thái sidebar từ close → open', () => {
      useUIStore.setState({ isSidebarOpen: false });

      useUIStore.getState().toggleSidebar();

      expect(useUIStore.getState().isSidebarOpen).toBe(true);
    });

    it('nên toggle đúng khi gọi nhiều lần liên tiếp', () => {
      useUIStore.getState().toggleSidebar(); // false
      useUIStore.getState().toggleSidebar(); // true
      useUIStore.getState().toggleSidebar(); // false

      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });
  });

  describe('setSidebarCollapsed()', () => {
    it('nên đặt sidebarCollapsed thành true', () => {
      useUIStore.getState().setSidebarCollapsed(true);
      expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    });

    it('nên đặt sidebarCollapsed thành false', () => {
      useUIStore.setState({ sidebarCollapsed: true });
      useUIStore.getState().setSidebarCollapsed(false);
      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });
  });

  describe('closeSidebar()', () => {
    it('nên đóng sidebar', () => {
      useUIStore.getState().closeSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });
  });

  describe('openModal() và closeModal()', () => {
    it('nên mở modal với đúng modalId', () => {
      useUIStore.getState().openModal('confirm-delete');
      expect(useUIStore.getState().modalOpen).toBe('confirm-delete');
    });

    it('nên thay thế modal cũ khi mở modal mới', () => {
      useUIStore.getState().openModal('modal-a');
      useUIStore.getState().openModal('modal-b');
      expect(useUIStore.getState().modalOpen).toBe('modal-b');
    });

    it('nên đóng modal và đặt modalOpen về null', () => {
      useUIStore.getState().openModal('some-modal');
      useUIStore.getState().closeModal();
      expect(useUIStore.getState().modalOpen).toBeNull();
    });
  });
});
