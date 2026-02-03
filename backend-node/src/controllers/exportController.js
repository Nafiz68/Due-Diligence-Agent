import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import Questionnaire from '../models/Questionnaire.js';

/**
 * Export answers as CSV
 */
export const exportCSV = async (req, res) => {
  try {
    const { questionnaireId } = req.params;
    console.log('Exporting CSV for questionnaire:', questionnaireId);

    const questionnaire = await Questionnaire.findById(questionnaireId);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }

    const answers = await Answer.find({ questionnaire: questionnaireId })
      .populate('question')
      .sort({ createdAt: 1 });

    console.log(`Found ${answers.length} answers to export`);

    // Export whatever answers are available (even if partial)
    if (answers.length === 0) {
      return res.status(404).json({ message: 'No answers found for this questionnaire. Please generate answers first.' });
    }

    // Create CSV content
    const csvRows = [
      ['Question Number', 'Category', 'Subcategory', 'Question', 'Answer', 'Status', 'Confidence Score', 'Reviewed By', 'Review Date']
    ];

    answers.forEach((answer, index) => {
      csvRows.push([
        index + 1,
        answer.question?.category || '',
        answer.question?.subcategory || '',
        answer.question?.questionText || '',
        answer.finalAnswer || answer.generatedAnswer || '',
        answer.status || '',
        answer.confidenceScore || '',
        answer.reviewedBy || '',
        answer.reviewedAt ? new Date(answer.reviewedAt).toLocaleDateString() : ''
      ]);
    });

    const csvContent = csvRows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = questionnaire.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}_answers.csv"`);
    return res.send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ message: 'Error exporting CSV', error: error.message });
  }
};

/**
 * Export answers as Excel
 */
export const exportExcel = async (req, res) => {
  try {
    const { questionnaireId } = req.params;
    console.log('Exporting Excel for questionnaire:', questionnaireId);

    const questionnaire = await Questionnaire.findById(questionnaireId);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }

    const answers = await Answer.find({ questionnaire: questionnaireId })
      .populate('question')
      .sort({ createdAt: 1 });

    console.log(`Found ${answers.length} answers to export`);

    // Export whatever answers are available (even if partial)
    if (answers.length === 0) {
      return res.status(404).json({ message: 'No answers found for this questionnaire. Please generate answers first.' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Answers');

    // Set column headers
    worksheet.columns = [
      { header: 'No.', key: 'number', width: 8 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Subcategory', key: 'subcategory', width: 20 },
      { header: 'Question', key: 'question', width: 50 },
      { header: 'Answer', key: 'answer', width: 60 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Confidence', key: 'confidence', width: 12 },
      { header: 'Reviewed By', key: 'reviewedBy', width: 20 },
      { header: 'Review Date', key: 'reviewDate', width: 15 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data rows
    answers.forEach((answer, index) => {
      worksheet.addRow({
        number: index + 1,
        category: answer.question?.category || '',
        subcategory: answer.question?.subcategory || '',
        question: answer.question?.questionText || '',
        answer: answer.finalAnswer || answer.generatedAnswer || '',
        status: answer.status || '',
        confidence: answer.confidenceScore ? (answer.confidenceScore * 100).toFixed(0) + '%' : '',
        reviewedBy: answer.reviewedBy || '',
        reviewDate: answer.reviewedAt ? new Date(answer.reviewedAt).toLocaleDateString() : ''
      });
    });

    // Auto-fit rows
    worksheet.eachRow((row) => {
      row.alignment = { vertical: 'top', wrapText: true };
    });

    const filename = questionnaire.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}_answers.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ message: 'Error exporting Excel', error: error.message });
  }
};

/**
 * Export answers as PDF
 */
export const exportPDF = async (req, res) => {
  try {
    const { questionnaireId } = req.params;
    console.log('Exporting PDF for questionnaire:', questionnaireId);

    const questionnaire = await Questionnaire.findById(questionnaireId);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }

    const answers = await Answer.find({ questionnaire: questionnaireId })
      .populate('question')
      .sort({ createdAt: 1 });

    console.log(`Found ${answers.length} answers to export`);

    // Export whatever answers are available (even if partial)
    if (answers.length === 0) {
      return res.status(404).json({ message: 'No answers found for this questionnaire. Please generate answers first.' });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    const filename = questionnaire.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}_answers.pdf"`);

    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text(questionnaire.name, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Add answers
    answers.forEach((answer, index) => {
      // Question number and category
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#2563eb')
        .text(`Question ${index + 1}`, { continued: true })
        .font('Helvetica').fillColor('black')
        .text(` - ${answer.question?.category || 'N/A'}${answer.question?.subcategory ? ' / ' + answer.question.subcategory : ''}`);
      
      doc.moveDown(0.5);

      // Question text
      doc.fontSize(11).font('Helvetica-Bold').fillColor('black')
        .text(answer.question?.questionText || 'N/A', { align: 'left' });
      
      doc.moveDown(0.5);

      // Answer
      doc.fontSize(10).font('Helvetica').fillColor('#374151')
        .text(answer.finalAnswer || answer.generatedAnswer || 'No answer generated', { align: 'justify' });
      
      doc.moveDown(0.5);

      // Metadata
      doc.fontSize(8).fillColor('#6b7280')
        .text(`Status: ${answer.status} | Confidence: ${answer.confidenceScore ? (answer.confidenceScore * 100).toFixed(0) + '%' : 'N/A'}${answer.reviewedBy ? ' | Reviewed by: ' + answer.reviewedBy : ''}`);
      
      doc.moveDown(1.5);

      // Add page break if needed
      if (doc.y > 700 && index < answers.length - 1) {
        doc.addPage();
      }
    });

    doc.end();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ message: 'Error exporting PDF', error: error.message });
  }
};
