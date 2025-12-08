// Simple toast notification utility

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
}

class ToastManager {
    private container: HTMLDivElement | null = null;

    private ensureContainer() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
            document.body.appendChild(this.container);
        }
        return this.container;
    }

    show({ message, type = 'info', duration = 4000 }: ToastOptions) {
        const container = this.ensureContainer();

        const toast = document.createElement('div');
        toast.style.cssText = `
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      font-weight: 500;
      max-width: 400px;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      transition: opacity 0.3s ease-out;
    `;

        // Set colors based on type
        const colors = {
            success: { bg: '#10B981', text: '#FFFFFF' },
            error: { bg: '#EF4444', text: '#FFFFFF' },
            warning: { bg: '#F59E0B', text: '#FFFFFF' },
            info: { bg: '#3B82F6', text: '#FFFFFF' },
        };

        const color = colors[type];
        toast.style.backgroundColor = color.bg;
        toast.style.color = color.text;
        toast.textContent = message;

        container.appendChild(toast);

        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
        if (!document.getElementById('toast-animations')) {
            style.id = 'toast-animations';
            document.head.appendChild(style);
        }

        // Auto remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                container.removeChild(toast);
                if (container.children.length === 0 && this.container) {
                    document.body.removeChild(this.container);
                    this.container = null;
                }
            }, 300);
        }, duration);
    }

    success(message: string, duration?: number) {
        this.show({ message, type: 'success', duration });
    }

    error(message: string, duration?: number) {
        this.show({ message, type: 'error', duration });
    }

    warning(message: string, duration?: number) {
        this.show({ message, type: 'warning', duration });
    }

    info(message: string, duration?: number) {
        this.show({ message, type: 'info', duration });
    }
}

export const toast = new ToastManager();
