export const generateQuestionPDF = async (question, answers, bestFitAnswer) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  const margin = 10;
  let yPosition = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxTextWidth = pageWidth - margin * 2;
  
  const checkPageBreak = (heightRequired) => {
    if (yPosition + heightRequired > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Academic Doubt Forum - Revision Sheet', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString();
  doc.text(`Generated on: ${dateStr}`, margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Subject: ${question.subject}`, margin, yPosition);
  doc.setTextColor(0, 0, 0);
  yPosition += 15;

  checkPageBreak(15);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(`Q: ${question.title}`, maxTextWidth);
  doc.text(titleLines, margin, yPosition);
  yPosition += titleLines.length * 6 + 5;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const bodyLines = doc.splitTextToSize(question.body, maxTextWidth);
  checkPageBreak(bodyLines.length * 6);
  doc.text(bodyLines, margin, yPosition);
  yPosition += bodyLines.length * 6 + 10;
  
  if (question.aiAnswer) {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('AI Instant Solution', margin, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const aiLines = doc.splitTextToSize(question.aiAnswer, maxTextWidth);
    checkPageBreak(aiLines.length * 5);
    doc.text(aiLines, margin, yPosition);
    yPosition += aiLines.length * 5 + 12;
  }
  if (bestFitAnswer) {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 100, 0);
    doc.text('AI Selected Top Solution', margin, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const bestFitLines = doc.splitTextToSize(`By ${bestFitAnswer.authorName} (${bestFitAnswer.authorRole}):\n${bestFitAnswer.body}`, maxTextWidth);
    checkPageBreak(bestFitLines.length * 6);
    doc.text(bestFitLines, margin, yPosition);
    yPosition += bestFitLines.length * 6 + 15;
  }

  const otherAnswers = answers.filter(a => !bestFitAnswer || a.id !== bestFitAnswer.id);
  if (otherAnswers.length > 0) {
    checkPageBreak(15);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Other Answers', margin, yPosition);
    yPosition += 8;

    otherAnswers.forEach(ans => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const authorText = `By ${ans.authorName} (${ans.authorRole}):`;
      checkPageBreak(10);
      doc.text(authorText, margin, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      const ansLines = doc.splitTextToSize(ans.body, maxTextWidth);
      checkPageBreak(ansLines.length * 6);
      doc.text(ansLines, margin, yPosition);
      yPosition += ansLines.length * 6 + 10;
    });
  }

  doc.save(`revision-sheet-${question.id}.pdf`);
};
