"""Build the homepage's authored example report; requires reportlab.
Run from any directory after node scripts/build-morrow-ad.mjs.
"""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'lib/campaign-example.json').read_text(encoding='utf-8-sig'))
OUT = ROOT / 'public/campaigns/morrow'
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleM', fontName='Helvetica-Bold', fontSize=34, leading=37, textColor=colors.HexColor('#1D2940'), spaceAfter=17))
styles.add(ParagraphStyle(name='Deck', fontSize=14, leading=20, textColor=colors.HexColor('#5D6678'), spaceAfter=18))
styles.add(ParagraphStyle(name='BodyM', fontSize=10.5, leading=15.5, textColor=colors.HexColor('#344055'), spaceAfter=10))
styles.add(ParagraphStyle(name='LabelM', fontName='Helvetica-Bold', fontSize=9, leading=13, textColor=colors.HexColor('#A94F35'), spaceAfter=10))
styles.add(ParagraphStyle(name='HeadingM', fontName='Helvetica-Bold', fontSize=16, leading=21, textColor=colors.HexColor('#244784'), spaceBefore=12, spaceAfter=9))
styles.add(ParagraphStyle(name='SmallM', fontSize=8, leading=12, textColor=colors.HexColor('#5D6678'), spaceAfter=6))
story = []
def p(text, style='BodyM'):
    return Paragraph(escape(text).replace('\n', '<br/>'), styles[style])
def add(text, style='BodyM'):
    story.append(p(text, style))
def title(n, name, deck):
    if story: story.append(PageBreak())
    add(f'MORROW / CAMPAIGN REVIEW PACK / {n:02}', 'LabelM')
    add(name, 'TitleM'); add(deck, 'Deck')
def footer(canvas, doc):
    canvas.setStrokeColor(colors.HexColor('#DDE2EA')); canvas.line(44, 45, 551, 45)
    canvas.setFont('Helvetica', 8); canvas.setFillColor(colors.HexColor('#5D6678'))
    canvas.drawString(44, 30, 'TheAIPods / Original authored sample / Fictional product / Not launched')
    canvas.drawRightString(551, 30, f'{doc.page} / 6')

title(1, 'Make room for\none good idea.', 'Morrow Focus Notebook\nA seven-day launch concept, prepared for human review.')
story.append(Image(str(OUT / 'launch-ad.png'), width=260, height=325, hAlign='LEFT'))
story.append(Spacer(1, 18))
add('THE BRIEF', 'LabelM'); add(DATA['brief']['objective'])
add('Inside: brief and evidence, positioning, ready-to-review copy, channel calendar, measurement specification, and approval checklist.', 'SmallM')
add('This is an original authored example, not output from a live agent run. The product photograph is an AI-generated concept. There are no real customer findings, campaign results, or connected accounts.', 'SmallM')

title(2, 'A brief with boundaries.', 'Research contribution / distinguish supplied inputs from hypotheses.')
for key in ['product', 'audience', 'offer', 'constraint']:
    add(key.upper(), 'LabelM'); add(DATA['brief'][key])
add('Evidence register', 'HeadingM')
for row in DATA['research']:
    add(row['signal'], 'HeadingM'); add(row['source'] + ' / ' + row['status'], 'LabelM'); add(row['decision'])

title(3, 'A clear creative direction.', 'Marketing + design contributions / one consistent idea across the campaign.')
add('Positioning', 'HeadingM'); add(DATA['positioning'])
for item in DATA['messagePillars']:
    add(item['title'], 'HeadingM'); add(item['copy'])
add('Creative specification', 'HeadingM')
add('Portrait social ad: 1080 x 1350 pixels (4:5). Warm stone, ivory linen, copper detail, and generous whitespace. Keep the headline above the product and the call to action in the lower safe area. Export: launch-ad.png.')
add('Primary ad copy', 'HeadingM'); add(DATA['copy']['primary'])
add('Alternative message for review', 'HeadingM'); add(DATA['copy']['variant'])
add('Design check: concept image is illustrative. Verify actual product construction and replace the image with an approved product photograph for any real launch.', 'SmallM')

title(4, 'Seven days. A useful rhythm.', 'Social contribution / proposed schedule, not scheduled posts.')
for item in DATA['calendar']:
    add(f"{item['day']} / {item['channel']} / {item['format']}", 'HeadingM')
    add(item['message']); add(f"Next action: {item['action']}\nResponsible role: {item['owner']}", 'SmallM')
add('Social caption', 'HeadingM'); add(DATA['copy']['social'])
add('The carousel and founder-style post are editorial directions, not delivered image files. Timing, channels, budget, and publishing permissions remain subject to approval.', 'SmallM')

title(5, 'The message, ready to refine.', 'Marketing contribution / launch email and review notes.')
add('Subject', 'LabelM'); add(DATA['copy']['emailSubject'], 'HeadingM')
add('Preview text', 'LabelM'); add(DATA['copy']['emailPreview'])
story.append(Spacer(1, 12)); add(DATA['copy']['emailBody'])
add('Before sending', 'HeadingM')
add('Use only an approved opt-in audience. Add the real product URL, sender identity, required company details, and unsubscribe mechanism. This example contains no working destination or mailing integration.')
add('Review decisions', 'HeadingM')
for i, item in enumerate(DATA['review'], 1): add(f'{i:02}. {item}')

title(6, 'Measure interest. Not fiction.', 'Analytics contribution / an instrumentation plan with no invented results.')
for row in DATA['measurement']:
    add(row['metric'], 'HeadingM'); add(row['definition'])
    add('Capture: ' + row['event'], 'LabelM'); add(row['decision'])
add('Attribution example', 'HeadingM'); add(DATA['utm'].replace('&', '\n&'), 'SmallM')
add('Test protocol', 'HeadingM'); add(DATA['analysisRule'])
add('Release status: awaiting human review', 'HeadingM')
add('The downloadable files are prepared creative and planning materials. No spend is allocated, no post is scheduled, no customer is contacted, and no performance outcome is claimed.')

SimpleDocTemplate(str(OUT / 'campaign-review.pdf'), pagesize=(595.28, 841.89), rightMargin=44, leftMargin=44, topMargin=45, bottomMargin=63, title='Morrow Focus Notebook - Campaign review pack', author='TheAIPods').build(story, onFirstPage=footer, onLaterPages=footer)
(OUT / 'campaign-copy.txt').write_text('\n\n'.join(f'{key.upper()}\n{value}' for key, value in DATA['copy'].items()), encoding='utf-8')
archive = ROOT / 'output/pdf'
archive.mkdir(parents=True, exist_ok=True)
(archive / 'morrow-campaign-review.pdf').write_bytes((OUT / 'campaign-review.pdf').read_bytes())
print('Created campaign-review.pdf and campaign-copy.txt')
