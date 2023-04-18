import { ElMessageBox, ElMessage } from 'element-plus';
import { i18n } from '@/i18n';
const { t } = i18n.global;

/**
 * @param text
 * @param type
 */
export function handleConfirm(
  text = '确定执行此操作吗？',
  type = 'warning',
  title = t('sale.index.A05_01_0036'),
  center = false,
  confirmButtonText = t('sale.index.A03_01_0055'),
  cancelButtonText = t('sale.index.A02_02_0017')
) {
  return ElMessageBox.confirm(text, title, { confirmButtonText, cancelButtonText, type, center });
}

/**
 * @param text
 * @param type
 */
export function handleMessage(text = '操作成功', type = 'success', showClose = true) {
  return ElMessage({
    showClose,
    message: text,
    type: type,
  });
}
