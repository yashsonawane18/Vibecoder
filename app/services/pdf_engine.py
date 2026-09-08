import io
from datetime import datetime
from typing import Dict, List, Any, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_revision_pdf(
    question: Dict[str, Any],
    answers: List[Dict[str, Any]],
    best_fit_answer: Optional[Dict[str, Any]] = None
) -> bytes:
    """
    Feature 3: Python PDF Generation
    Generates a formatted academic revision sheet using ReportLab.
    Returns: PDF bytes stream
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#312E81")
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#6B7280")
    )

    q_title_style = ParagraphStyle(
        'QuestionTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#111827")
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#374151")
    )

    section_header_style = ParagraphStyle(
        'SectionHead',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#4338CA")
    )

    ai_style = ParagraphStyle(
        'AIText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#1E1B4B")
    )

    story = []

    # Title & Metadata
    story.append(Paragraph("🎓 Academic Doubt Forum — Revision Sheet", title_style))
    today_str = datetime.now().strftime("%B %d, %Y - %I:%M %p")
    story.append(Paragraph(f"Generated: {today_str} | Subject: <b>{question.get('subject')}</b> | Status: <b>{question.get('status', 'open').capitalize()}</b>", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#E5E7EB"), spaceAfter=12))

    # Question Block
    author = question.get('author_name') or question.get('authorName', 'Student')
    role = question.get('author_role') or question.get('authorRole', 'student')
    story.append(Paragraph(f"<b>Doubt:</b> {question.get('title')}", q_title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"<i>Asked by: {author} ({role.capitalize()})</i>", subtitle_style))
    story.append(Spacer(1, 6))
    
    clean_body = question.get('body', '').replace("\n", "<br/>")
    story.append(Paragraph(clean_body, body_style))
    story.append(Spacer(1, 14))

    # AI Instant Answer (if exists)
    ai_answer = question.get('ai_answer') or question.get('aiAnswer')
    if ai_answer:
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#C7D2FE"), spaceAfter=8))
        story.append(Paragraph("🤖 Instant AI Tutor Explanation", section_header_style))
        clean_ai = ai_answer.replace("\n", "<br/>").replace("**", "<b>")
        # Handle simple bold tags
        clean_ai = clean_ai.replace("<b>", "<b>").replace("</b>", "</b>")
        ai_table = Table([[Paragraph(clean_ai, ai_style)]], colWidths=[7.2 * inch])
        ai_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EEF2FF")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#C7D2FE")),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(ai_table)
        story.append(Spacer(1, 14))

    # Best Fit Solution (Feature 2)
    if best_fit_answer:
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#A7F3D0"), spaceAfter=8))
        story.append(Paragraph("✅ AI Selected Top Solution", section_header_style))
        ans_author = best_fit_answer.get('author_name') or best_fit_answer.get('authorName', 'Mentor')
        ans_role = best_fit_answer.get('author_role') or best_fit_answer.get('authorRole', 'Senior')
        votes = best_fit_answer.get('votes', 0)
        
        reason = best_fit_answer.get('best_fit_reason') or best_fit_answer.get('bestFitReason', '')
        reason_html = f"<br/><i><b>AI Rationale:</b> {reason}</i>" if reason else ""

        clean_best_ans = best_fit_answer.get('body', '').replace("\n", "<br/>")
        content = f"<b>Answered by {ans_author} ({ans_role.capitalize()}) | Upvotes: {votes}</b>{reason_html}<br/><br/>{clean_best_ans}"

        best_table = Table([[Paragraph(content, body_style)]], colWidths=[7.2 * inch])
        best_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#ECFDF5")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#10B981")),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(best_table)
        story.append(Spacer(1, 14))

    # Other Community Answers
    other_answers = [
        a for a in answers 
        if not (best_fit_answer and a.get('id') == best_fit_answer.get('id'))
    ]

    if other_answers:
        story.append(Paragraph(f"Community Answers ({len(other_answers)})", section_header_style))
        story.append(Spacer(1, 6))

        for a in other_answers:
            a_author = a.get('author_name') or a.get('authorName', 'Mentor')
            a_role = a.get('author_role') or a.get('authorRole', 'peer')
            a_votes = a.get('votes', 0)
            a_body = a.get('body', '').replace("\n", "<br/>")

            card_content = f"<b>{a_author}</b> ({a_role.capitalize()}) | Upvotes: {a_votes}<br/><br/>{a_body}"
            ans_table = Table([[Paragraph(card_content, body_style)]], colWidths=[7.2 * inch])
            ans_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F9FAFB")),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(ans_table)
            story.append(Spacer(1, 8))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
