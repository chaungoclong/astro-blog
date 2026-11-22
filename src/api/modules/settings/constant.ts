const MIN_NEW_PASSWORD_LENGTH = 6;

export const SETTINGS_CONSTANTS = {
  MIN_NEW_PASSWORD_LENGTH,
  HEX_COLOR_PATTERN: /^#[0-9a-fA-F]{6}$/,
  THEME_COLOR_KEYS: ['brand_color', 'brand_color_deep', 'surface_color'] as const,
  CURRENT_PASSWORD_REQUIRED_MESSAGE: 'Vui lòng nhập mật khẩu hiện tại.',
  INVALID_CURRENT_PASSWORD_MESSAGE: 'Mật khẩu hiện tại không chính xác.',
  SHORT_PASSWORD_MESSAGE: `Mật khẩu mới phải có ít nhất ${MIN_NEW_PASSWORD_LENGTH} ký tự.`,
  INVALID_HEX_COLOR_MESSAGE: 'Màu sắc phải ở định dạng mã HEX, ví dụ #0f766e.',
  SETTINGS_SAVED_MESSAGE: 'Cài đặt đã được lưu thành công!',
  SETTINGS_ERROR_MESSAGE: 'Lỗi khi lưu cài đặt.',
} as const;
