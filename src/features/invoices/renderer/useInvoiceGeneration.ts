import { useInvoiceStore } from '../../../shared/store';

export const useInvoiceGeneration = () => {
  const {
    price,
    month,
    year,
    templateId,
    invoicePrefix,
    isAuthorized,
    setGenerationStep,
    setStatus,
    setIsSettingsOpen,
  } = useInvoiceStore();

  const handleGenerate = async () => {
    const finalTemplateId = templateId.trim();

    if (!price) {
      setStatus('Будь ласка, введіть суму інвойсу', 'error');
      return;
    }

    if (!year) {
      setStatus('Будь ласка, введіть рік', 'error');
      return;
    }

    if (!month) {
      setStatus('Будь ласка, виберіть місяць', 'error');
      return;
    }

    if (!finalTemplateId) {
      setStatus('Template ID не налаштовано. Перейдіть в налаштування ⚙️', 'error');
      setIsSettingsOpen(true);
      return;
    }

    if (!isAuthorized) {
      setStatus('Будь ласка, авторизуйтесь через Google', 'error');
      return;
    }

    setGenerationStep(0);
    setStatus('Підготовка даних...', 'info');

    try {
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      const monthIndex = monthNames.indexOf(month);
      const monthNum = (monthIndex + 1).toString().padStart(2, '0');
      const shortYear = year.slice(-2);
      const currentPrefix = invoicePrefix || '_PREFIX_';

      const invoiceNumber = `${currentPrefix}-${shortYear}-${monthNum}`;
      const lastDay = new Date(parseInt(year), monthIndex + 1, 0).getDate();
      const invoiceDate = `${month} ${lastDay}, ${year}`;

      const numPrice = parseFloat(price) || 0;
      const formattedPrice = `€${numPrice.toFixed(2)}`;

      setGenerationStep(1);
      setStatus("Зв'язок з Google API...", 'info');

      const result = await window.electronAPI.generateInvoice({
        templateId: finalTemplateId,
        fileName: invoiceNumber,
        data: {
          'invoice-number': invoiceNumber,
          'period-month': month,
          price: formattedPrice,
          total: formattedPrice,
          'grand-total': formattedPrice,
          'invoice-date': invoiceDate,
        },
      });

      if (result.success) {
        setGenerationStep(4);
        setStatus(`Готово! Файл збережено: ${result.path}`, 'success');
      } else {
        setGenerationStep(null);
        setStatus(`Помилка: ${result.error}`, 'error');
      }
    } catch (err: any) {
      setGenerationStep(null);
      setStatus(`Помилка: ${err.message}`, 'error');
    }
  };

  return { handleGenerate };
};
