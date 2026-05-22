from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
import copy

# ── Brand Colours ──────────────────────────────────────────────
VIOLET   = RGBColor(0x7B, 0x5E, 0xA7)
ROSE     = RGBColor(0xC9, 0x6B, 0x9A)
BLUE     = RGBColor(0x4A, 0x6F, 0xD4)
DARK     = RGBColor(0x1A, 0x16, 0x25)
WHITE    = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_BG = RGBColor(0xF9, 0xF5, 0xF0)
MUTED    = RGBColor(0x5A, 0x54, 0x68)
GOLD     = RGBColor(0xD4, 0xAF, 0x37)
GREEN    = RGBColor(0x2E, 0x7D, 0x32)
ORANGE   = RGBColor(0xE6, 0x51, 0x00)
CARD_BG  = RGBColor(0xF3, 0xEF, 0xF9)

# ── Helpers ────────────────────────────────────────────────────
def add_rect(slide, l, t, w, h, fill=None, line_color=None, line_w=None):
    shape = slide.shapes.add_shape(1, Inches(l), Inches(t), Inches(w), Inches(h))
    shape.line.fill.background()
    if fill:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill
    else:
        shape.fill.background()
    if line_color:
        shape.line.color.rgb = line_color
        shape.line.width = Pt(line_w or 1)
    else:
        shape.line.fill.background()
    return shape

def add_text(slide, text, l, t, w, h, size=12, bold=False, color=DARK,
             align=PP_ALIGN.LEFT, italic=False, wrap=True, font_name="Calibri"):
    txb = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    txb.word_wrap = wrap
    tf = txb.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    run.font.name = font_name
    return txb

def add_gradient_rect(slide, l, t, w, h, color1=VIOLET, color2=ROSE):
    """Simulate gradient with two overlapping rects (pptx limitation)."""
    r = add_rect(slide, l, t, w, h, fill=color1)
    return r

def add_bullet(slide, text, l, t, w, h, color=DARK, size=10, indent=0):
    txb = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    txb.word_wrap = True
    tf = txb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    run = p.add_run()
    run.text = f"  ✓  {text}"
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.font.name = "Calibri"
    return txb

prs = Presentation()
prs.slide_width  = Inches(13.33)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]  # completely blank

# ══════════════════════════════════════════════════════════════════
# SLIDE 1 ─ COVER
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)

# Full-bleed dark background
add_rect(slide, 0, 0, 13.33, 7.5, fill=DARK)

# Decorative violet circle top-right
c = slide.shapes.add_shape(9, Inches(9.5), Inches(-1.2), Inches(4.5), Inches(4.5))
c.fill.solid(); c.fill.fore_color.rgb = RGBColor(0x3D, 0x20, 0x70)
c.line.fill.background()

# Decorative rose circle bottom-left
c2 = slide.shapes.add_shape(9, Inches(-1.5), Inches(5), Inches(4), Inches(4))
c2.fill.solid(); c2.fill.fore_color.rgb = RGBColor(0x7A, 0x2A, 0x55)
c2.line.fill.background()

# Accent bar
add_rect(slide, 0.7, 2.0, 0.08, 2.0, fill=ROSE)

# Company name
add_text(slide, "BOUTIQUE MANAGEMENT", 0.9, 2.0, 9, 0.5,
         size=13, bold=True, color=ROSE, font_name="Calibri")

# Main title
add_text(slide, "Subscription Plans", 0.9, 2.55, 9, 1.0,
         size=44, bold=True, color=WHITE, font_name="Calibri")

# Subtitle
add_text(slide, "Choose the perfect plan to grow your boutique business",
         0.9, 3.65, 9, 0.5, size=16, color=RGBColor(0xC0, 0xB0, 0xD8),
         font_name="Calibri")

# Tagline pill
pill = add_rect(slide, 0.9, 4.35, 3.6, 0.42, fill=RGBColor(0x4A, 0x1A, 0x6A))
add_text(slide, "✦  Premium · Reliable · Scalable", 0.9, 4.35, 3.6, 0.42,
         size=11, color=ROSE, align=PP_ALIGN.CENTER, font_name="Calibri")

# Year
add_text(slide, "2025", 11.8, 6.9, 1, 0.4, size=10, color=MUTED, font_name="Calibri")

# ══════════════════════════════════════════════════════════════════
# SLIDE 2 ─ WHY BOUTIQUE MANAGEMENT?
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, 13.33, 7.5, fill=LIGHT_BG)

# Header band
add_rect(slide, 0, 0, 13.33, 1.4, fill=VIOLET)
add_text(slide, "BOUTIQUE MANAGEMENT", 0.4, 0.12, 8, 0.35,
         size=10, bold=True, color=RGBColor(0xD0, 0xC0, 0xEA), font_name="Calibri")
add_text(slide, "Why Choose Us?", 0.4, 0.48, 10, 0.7,
         size=30, bold=True, color=WHITE, font_name="Calibri")

# 4 value pillars
pillars = [
    ("📱", "Mobile-First\nDesign",       "Works perfectly on any phone or tablet — no laptop needed"),
    ("☁️", "Cloud\nPowered",             "Your data is safe, backed up and accessible anywhere"),
    ("🔒", "Secure &\nPrivate",          "Each boutique's data is completely isolated and protected"),
    ("⚡", "Real-Time\nUpdates",         "Orders and billing update instantly across all your devices"),
]

for i, (icon, title, desc) in enumerate(pillars):
    x = 0.4 + i * 3.2
    add_rect(slide, x, 1.7, 2.9, 4.8, fill=WHITE)
    # top accent
    add_rect(slide, x, 1.7, 2.9, 0.08, fill=VIOLET)
    add_text(slide, icon,  x+0.1, 1.85, 2.7, 0.7, size=34, align=PP_ALIGN.CENTER)
    add_text(slide, title, x+0.1, 2.65, 2.7, 0.7, size=15, bold=True,
             color=VIOLET, align=PP_ALIGN.CENTER, font_name="Calibri")
    add_text(slide, desc,  x+0.15, 3.45, 2.6, 1.5, size=11, color=MUTED,
             align=PP_ALIGN.CENTER, font_name="Calibri")

add_text(slide, "Trusted by boutiques across India  ·  No technical knowledge required  ·  Setup in minutes",
         0.4, 6.8, 12.5, 0.4, size=10, color=MUTED, align=PP_ALIGN.CENTER, font_name="Calibri")

# ══════════════════════════════════════════════════════════════════
# SLIDE 3 ─ KEY FEATURES OVERVIEW
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, 13.33, 7.5, fill=LIGHT_BG)

add_rect(slide, 0, 0, 13.33, 1.4, fill=RGBColor(0x1A, 0x0F, 0x35))
add_text(slide, "BOUTIQUE MANAGEMENT", 0.4, 0.12, 8, 0.35,
         size=10, bold=True, color=ROSE, font_name="Calibri")
add_text(slide, "Everything You Need to Run Your Boutique", 0.4, 0.48, 12, 0.7,
         size=26, bold=True, color=WHITE, font_name="Calibri")

features = [
    ("🛍️", "Orders Management",
     ["Quick order creation", "Track delivery timelines", "Pending vs delivered view",
      "Customer details & history", "Priority order highlights"]),
    ("📐", "Measurements Module",
     ["Store customer measurements", "Multiple garment types", "Custom measurement fields",
      "Measurement history", "Notes & special instructions"]),
    ("🧾", "Billing & Receipts",
     ["Auto-generate invoices", "GST / tax support", "Printable PDF bills",
      "Payment status tracking", "Balance & advance tracking"]),
    ("📊", "Reports & Analytics",
     ["Monthly revenue charts", "Order delivery rates", "Top customer insights",
      "Pending balance overview", "6-month trend analysis"]),
    ("👥", "Staff Management",
     ["Invite staff by phone", "Role-based access control", "Active / inactive toggle",
      "Staff can update orders", "Boutique admin oversight"]),
    ("💳", "Subscription View",
     ["See current plan details", "View expiry date", "Feature list included",
      "Plan usage limits", "Contact admin to upgrade"]),
]

cols = 3
for i, (icon, title, bullets) in enumerate(features):
    row = i // cols
    col = i % cols
    x = 0.35 + col * 4.33
    y = 1.6 + row * 2.75
    card = add_rect(slide, x, y, 4.0, 2.55, fill=WHITE)
    add_rect(slide, x, y, 4.0, 0.06, fill=VIOLET if i % 2 == 0 else ROSE)
    add_text(slide, icon + "  " + title, x+0.15, y+0.1, 3.7, 0.45,
             size=13, bold=True, color=DARK, font_name="Calibri")
    for j, b in enumerate(bullets[:4]):
        add_text(slide, "✓  " + b, x+0.15, y+0.58+(j*0.44), 3.7, 0.42,
                 size=10, color=MUTED, font_name="Calibri")

# ══════════════════════════════════════════════════════════════════
# SLIDE 4 ─ ORDERS MODULE DEEP DIVE
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, 13.33, 7.5, fill=LIGHT_BG)

add_rect(slide, 0, 0, 13.33, 1.4, fill=BLUE)
add_text(slide, "BOUTIQUE MANAGEMENT  ·  Feature Deep Dive", 0.4, 0.12, 10, 0.35,
         size=10, bold=True, color=RGBColor(0xC0, 0xD5, 0xF5), font_name="Calibri")
add_text(slide, "🛍️  Orders Management — Your Home Screen", 0.4, 0.48, 12, 0.7,
         size=26, bold=True, color=WHITE, font_name="Calibri")

# Left — description
add_rect(slide, 0.4, 1.6, 5.8, 5.5, fill=WHITE)
add_rect(slide, 0.4, 1.6, 5.8, 0.08, fill=BLUE)

add_text(slide, "How It Works", 0.6, 1.72, 5.4, 0.4, size=14, bold=True, color=BLUE, font_name="Calibri")

steps = [
    ("1", "Create an order", "Enter customer name, garment types, delivery date and advance payment in seconds."),
    ("2", "Track progress",  "Orders move through Pending → In Progress → Ready → Delivered automatically."),
    ("3", "Get paid",        "Record payments, see live balance due. Overdue orders are flagged in red."),
    ("4", "Deliver",         "Mark as delivered. The customer balance clears and revenue is recorded."),
]
for i, (num, title, desc) in enumerate(steps):
    y = 2.3 + i * 1.12
    circle = slide.shapes.add_shape(9, Inches(0.6), Inches(y), Inches(0.38), Inches(0.38))
    circle.fill.solid(); circle.fill.fore_color.rgb = BLUE; circle.line.fill.background()
    add_text(slide, num, 0.6, y-0.01, 0.38, 0.4, size=11, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, font_name="Calibri")
    add_text(slide, title, 1.1, y-0.02, 4.8, 0.28, size=11, bold=True, color=DARK, font_name="Calibri")
    add_text(slide, desc,  1.1, y+0.26, 4.9, 0.55, size=10, color=MUTED, font_name="Calibri")

# Right — feature list
add_rect(slide, 6.6, 1.6, 6.3, 5.5, fill=WHITE)
add_rect(slide, 6.6, 1.6, 6.3, 0.08, fill=ROSE)

add_text(slide, "Key Capabilities", 6.8, 1.72, 5.9, 0.4, size=14, bold=True, color=ROSE, font_name="Calibri")

order_features = [
    "Quick order creation (under 60 seconds)",
    "Auto-calculate total, advance & balance",
    "Status tracking: Pending / In Progress / Ready / Delivered",
    "Overdue delivery alerts highlighted in red",
    "Search & filter orders by customer name",
    "Sort by newest, delivery date, or amount",
    "4 live stats: Total, Pending, Delivered, Revenue",
    "Attach garment items with individual rates",
    "Add profit margin per garment item",
    "Notes field for special instructions",
    "Order history with full audit trail",
    "Staff can update status (cannot delete)",
]
for i, feat in enumerate(order_features):
    add_text(slide, "✓  " + feat, 6.8, 2.25+(i*0.38), 5.9, 0.36,
             size=10, color=DARK if i % 2 == 0 else MUTED, font_name="Calibri")

# ══════════════════════════════════════════════════════════════════
# SLIDE 5 ─ MEASUREMENTS & BILLING
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, 13.33, 7.5, fill=LIGHT_BG)

add_rect(slide, 0, 0, 13.33, 1.4, fill=VIOLET)
add_text(slide, "BOUTIQUE MANAGEMENT  ·  Feature Deep Dive", 0.4, 0.12, 10, 0.35,
         size=10, bold=True, color=RGBColor(0xD0, 0xC0, 0xEA), font_name="Calibri")
add_text(slide, "📐  Measurements  &  🧾  Billing", 0.4, 0.48, 12, 0.7,
         size=26, bold=True, color=WHITE, font_name="Calibri")

# Measurements panel
add_rect(slide, 0.4, 1.6, 6.0, 5.5, fill=WHITE)
add_rect(slide, 0.4, 1.6, 6.0, 0.08, fill=VIOLET)
add_text(slide, "📐  Measurements Module", 0.6, 1.72, 5.6, 0.45,
         size=14, bold=True, color=VIOLET, font_name="Calibri")

meas_items = [
    ("Customer Profiles", "Store measurements for unlimited customers with phone number lookup"),
    ("Multiple Garments",  "Blouse, Lehenga, Saree, Churidar, Gown, Frock, Pavadai & more"),
    ("Custom Fields",      "Add unlimited custom measurement fields per garment type"),
    ("Measurement History","Track changes over time — never lose old measurements"),
    ("Quick Lookup",       "Search customer by name or phone in seconds"),
    ("Notes & Instructions","Add special tailoring notes per customer or garment"),
    ("Edit Anytime",        "Update measurements as customer body changes"),
]
for i, (title, desc) in enumerate(meas_items):
    y = 2.28 + i * 0.72
    add_text(slide, "✦  " + title, 0.6, y, 5.5, 0.28, size=11, bold=True, color=VIOLET, font_name="Calibri")
    add_text(slide, desc, 0.85, y+0.27, 5.2, 0.35, size=10, color=MUTED, font_name="Calibri")

# Billing panel
add_rect(slide, 6.9, 1.6, 6.0, 5.5, fill=WHITE)
add_rect(slide, 6.9, 1.6, 6.0, 0.08, fill=ROSE)
add_text(slide, "🧾  Billing & Receipts", 7.1, 1.72, 5.6, 0.45,
         size=14, bold=True, color=ROSE, font_name="Calibri")

bill_items = [
    ("Auto Invoice Numbers",  "Sequential invoice numbering (INV-0001, 0002…)"),
    ("Line-Item Billing",     "Add multiple items with quantity, rate & auto-total"),
    ("GST Support",           "Apply GST percentage — auto-calculates tax amount"),
    ("Advance & Balance",     "Track how much is paid and how much is pending"),
    ("Payment Status",        "Paid / Partial / Pending status at a glance"),
    ("Print-Ready Bills",     "One-click browser print — formatted invoice layout"),
    ("Bill History",          "All invoices stored permanently with full details"),
]
for i, (title, desc) in enumerate(bill_items):
    y = 2.28 + i * 0.72
    add_text(slide, "✦  " + title, 7.1, y, 5.6, 0.28, size=11, bold=True, color=ROSE, font_name="Calibri")
    add_text(slide, desc, 7.35, y+0.27, 5.3, 0.35, size=10, color=MUTED, font_name="Calibri")

# ══════════════════════════════════════════════════════════════════
# SLIDE 6 ─ REPORTS & STAFF MANAGEMENT
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, 13.33, 7.5, fill=LIGHT_BG)

add_rect(slide, 0, 0, 13.33, 1.4, fill=RGBColor(0x1A, 0x0F, 0x35))
add_text(slide, "BOUTIQUE MANAGEMENT  ·  Feature Deep Dive", 0.4, 0.12, 10, 0.35,
         size=10, bold=True, color=ROSE, font_name="Calibri")
add_text(slide, "📊  Reports & Analytics  +  👥  Staff Management", 0.4, 0.48, 12, 0.7,
         size=24, bold=True, color=WHITE, font_name="Calibri")

# Reports
add_rect(slide, 0.4, 1.6, 6.0, 5.5, fill=WHITE)
add_rect(slide, 0.4, 1.6, 6.0, 0.08, fill=GREEN)
add_text(slide, "📊  Reports & Analytics", 0.6, 1.72, 5.6, 0.45,
         size=14, bold=True, color=GREEN, font_name="Calibri")

report_items = [
    ("Monthly Revenue Chart",   "Bar chart showing last 6 months of collected revenue"),
    ("Orders Trend Line",       "See how many orders came in each month vs delivered"),
    ("Order Status Pie Chart",  "Visual breakdown: pending, in-progress, ready, delivered"),
    ("Top 5 Customers",         "Ranked by total order value — know your best clients"),
    ("Key Metrics Dashboard",   "Total revenue, pending balance, order count, delivery rate"),
    ("Delivery Rate %",         "Track how efficiently you're fulfilling orders"),
    ("Revenue vs Balance",      "How much you've collected vs how much is still owed"),
]
for i, (title, desc) in enumerate(report_items):
    y = 2.28 + i * 0.72
    add_text(slide, "✦  " + title, 0.6, y, 5.5, 0.28, size=11, bold=True, color=GREEN, font_name="Calibri")
    add_text(slide, desc, 0.85, y+0.27, 5.2, 0.35, size=10, color=MUTED, font_name="Calibri")

# Staff
add_rect(slide, 6.9, 1.6, 6.0, 5.5, fill=WHITE)
add_rect(slide, 6.9, 1.6, 6.0, 0.08, fill=ORANGE)
add_text(slide, "👥  Staff Management", 7.1, 1.72, 5.6, 0.45,
         size=14, bold=True, color=ORANGE, font_name="Calibri")

staff_items = [
    ("Invite by Phone",       "Staff receives invite and logs in with their phone number"),
    ("Two Roles Available",   "Admin (full access) or Staff (view + update status only)"),
    ("Activate / Deactivate", "Instantly block access if staff member leaves"),
    ("No Tech Setup Needed",  "Staff just installs the app and logs in — nothing else"),
    ("Order Status Updates",  "Staff can mark orders as In Progress, Ready, Delivered"),
    ("View Customer Details", "Staff can see customer name, phone and garment details"),
    ("No Delete Access",      "Staff cannot delete any orders, measurements or bills"),
]
for i, (title, desc) in enumerate(staff_items):
    y = 2.28 + i * 0.72
    add_text(slide, "✦  " + title, 7.1, y, 5.6, 0.28, size=11, bold=True, color=ORANGE, font_name="Calibri")
    add_text(slide, desc, 7.35, y+0.27, 5.3, 0.35, size=10, color=MUTED, font_name="Calibri")

# ══════════════════════════════════════════════════════════════════
# SLIDE 7 ─ SUBSCRIPTION PLANS COMPARISON
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, 13.33, 7.5, fill=RGBColor(0x0F, 0x0D, 0x1A))

# Header
add_rect(slide, 0, 0, 13.33, 1.3, fill=RGBColor(0x1A, 0x0F, 0x35))
add_text(slide, "BOUTIQUE MANAGEMENT", 0.4, 0.12, 8, 0.32,
         size=10, bold=True, color=ROSE, font_name="Calibri")
add_text(slide, "Choose Your Plan", 0.4, 0.48, 12, 0.65,
         size=30, bold=True, color=WHITE, font_name="Calibri")

# Plan definitions
plans = [
    {
        "name":    "FREE",
        "price":   "₹0",
        "period":  "/month",
        "tagline": "Get started",
        "color":   RGBColor(0x5A, 0x54, 0x68),
        "accent":  RGBColor(0x8A, 0x84, 0x98),
        "popular": False,
        "orders":  "100 orders",
        "staff":   "2 staff",
        "features":["Orders management","Customer measurements","Basic billing","Basic reports"],
        "missing": ["Advanced reports","Staff management","Priority support"],
    },
    {
        "name":    "BASIC",
        "price":   "₹499",
        "period":  "/month",
        "tagline": "Small boutiques",
        "color":   BLUE,
        "accent":  RGBColor(0x7A, 0x9C, 0xE8),
        "popular": False,
        "orders":  "500 orders",
        "staff":   "5 staff",
        "features":["Orders management","Customer measurements","Billing & GST","Reports & charts","Staff management","Print bills"],
        "missing": ["Priority support"],
    },
    {
        "name":    "PRO",
        "price":   "₹999",
        "period":  "/month",
        "tagline": "⭐  Most Popular",
        "color":   VIOLET,
        "accent":  RGBColor(0xA0, 0x8C, 0xC8),
        "popular": True,
        "orders":  "5,000 orders",
        "staff":   "10 staff",
        "features":["Everything in Basic","Advanced analytics","Top customer insights","Revenue vs balance view","Priority email support","Unlimited measurements"],
        "missing": [],
    },
    {
        "name":    "ENTERPRISE",
        "price":   "₹2,499",
        "period":  "/month",
        "tagline": "Large boutiques",
        "color":   ROSE,
        "accent":  RGBColor(0xE8, 0xA0, 0xBF),
        "popular": False,
        "orders":  "Unlimited",
        "staff":   "50 staff",
        "features":["Everything in Pro","Unlimited orders","50 staff members","Dedicated support","Custom feature requests","Data backup & export"],
        "missing": [],
    },
]

card_w = 2.95
for i, plan in enumerate(plans):
    x = 0.35 + i * 3.22
    y_start = 1.45

    # Card background
    card_bg = RGBColor(0x1E, 0x18, 0x35) if not plan["popular"] else RGBColor(0x2A, 0x18, 0x48)
    add_rect(slide, x, y_start, card_w, 5.7, fill=card_bg)

    # Top colour bar
    add_rect(slide, x, y_start, card_w, 0.12, fill=plan["color"])

    # Popular badge
    if plan["popular"]:
        badge = add_rect(slide, x+0.5, y_start-0.25, 1.95, 0.3, fill=GOLD)
        add_text(slide, "MOST POPULAR", x+0.5, y_start-0.25, 1.95, 0.3,
                 size=8, bold=True, color=DARK, align=PP_ALIGN.CENTER, font_name="Calibri")

    # Plan name
    add_text(slide, plan["name"], x+0.15, y_start+0.2, card_w-0.3, 0.38,
             size=16, bold=True, color=plan["color"], font_name="Calibri")

    # Tagline
    is_popular_str = "⭐" in plan["tagline"]
    tag_color = GOLD if is_popular_str else RGBColor(0x90, 0x88, 0xA8)
    add_text(slide, plan["tagline"], x+0.15, y_start+0.6, card_w-0.3, 0.3,
             size=9, color=tag_color, italic=not is_popular_str, font_name="Calibri")

    # Price
    add_text(slide, plan["price"], x+0.15, y_start+0.96, card_w-0.3, 0.65,
             size=30, bold=True, color=WHITE, font_name="Calibri")
    add_text(slide, plan["period"], x+0.15, y_start+1.6, card_w-0.3, 0.3,
             size=10, color=RGBColor(0x90, 0x88, 0xA8), font_name="Calibri")

    # Divider
    add_rect(slide, x+0.15, y_start+1.98, card_w-0.3, 0.01, fill=RGBColor(0x3A, 0x30, 0x55))

    # Limits
    add_text(slide, f"📦  {plan['orders']}   👥  {plan['staff']}",
             x+0.15, y_start+2.08, card_w-0.3, 0.32, size=9, color=plan["accent"], font_name="Calibri")

    # Features
    for j, feat in enumerate(plan["features"]):
        add_text(slide, "✓  " + feat, x+0.15, y_start+2.52+(j*0.44), card_w-0.3, 0.4,
                 size=9, color=WHITE, font_name="Calibri")

# ══════════════════════════════════════════════════════════════════
# SLIDE 8 ─ PLAN FEATURES TABLE
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, 13.33, 7.5, fill=LIGHT_BG)

add_rect(slide, 0, 0, 13.33, 1.3, fill=VIOLET)
add_text(slide, "BOUTIQUE MANAGEMENT", 0.4, 0.12, 8, 0.32,
         size=10, bold=True, color=RGBColor(0xD0, 0xC0, 0xEA), font_name="Calibri")
add_text(slide, "Feature Comparison", 0.4, 0.48, 12, 0.65,
         size=30, bold=True, color=WHITE, font_name="Calibri")

# Table headers
hdrs = ["Feature", "Free", "Basic", "Pro ⭐", "Enterprise"]
hdr_colors = [DARK, MUTED, BLUE, VIOLET, ROSE]
col_x = [0.3, 4.6, 6.5, 8.4, 10.6]
col_w = [4.2, 1.8, 1.8, 2.1, 2.4]

# Header row
add_rect(slide, 0.3, 1.4, 12.7, 0.5, fill=RGBColor(0xE8, 0xE0, 0xF5))
for i, (hdr, col) in enumerate(zip(hdrs, hdr_colors)):
    bold = i > 0
    add_text(slide, hdr, col_x[i]+0.1, 1.46, col_w[i]-0.1, 0.38,
             size=11, bold=bold, color=col if i > 0 else DARK,
             align=PP_ALIGN.CENTER if i > 0 else PP_ALIGN.LEFT, font_name="Calibri")

rows = [
    ("Orders per month",          "100",  "500",   "5,000",   "Unlimited"),
    ("Staff accounts",            "2",    "5",     "10",      "50"),
    ("Order management",          "✓",    "✓",     "✓",       "✓"),
    ("Customer measurements",     "✓",    "✓",     "✓",       "✓"),
    ("Basic billing",             "✓",    "✓",     "✓",       "✓"),
    ("GST billing",               "✗",    "✓",     "✓",       "✓"),
    ("Print-ready invoices",      "✗",    "✓",     "✓",       "✓"),
    ("Basic reports",             "✓",    "✓",     "✓",       "✓"),
    ("Advanced analytics",        "✗",    "✗",     "✓",       "✓"),
    ("Top customer insights",     "✗",    "✗",     "✓",       "✓"),
    ("Staff management",          "✗",    "✓",     "✓",       "✓"),
    ("Priority support",          "✗",    "✗",     "✓",       "✓"),
    ("Dedicated account manager", "✗",    "✗",     "✗",       "✓"),
    ("Custom feature requests",   "✗",    "✗",     "✗",       "✓"),
]

for r, (feat, *vals) in enumerate(rows):
    y = 1.95 + r * 0.38
    row_bg = WHITE if r % 2 == 0 else RGBColor(0xF3, 0xEF, 0xF9)
    add_rect(slide, 0.3, y, 12.7, 0.38, fill=row_bg)
    add_text(slide, feat, col_x[0]+0.1, y+0.02, col_w[0]-0.1, 0.34,
             size=10, color=DARK, font_name="Calibri")
    for i, val in enumerate(vals):
        col_idx = i + 1
        c = GREEN if val == "✓" else (RGBColor(0xCC,0x33,0x33) if val == "✗" else DARK)
        bold = val in ("✓","✗")
        add_text(slide, val, col_x[col_idx]+0.1, y+0.02, col_w[col_idx]-0.1, 0.34,
                 size=10, bold=bold, color=c, align=PP_ALIGN.CENTER, font_name="Calibri")

# ══════════════════════════════════════════════════════════════════
# SLIDE 9 ─ HOW THE SYSTEM PROTECTS YOUR DATA
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, 13.33, 7.5, fill=LIGHT_BG)

add_rect(slide, 0, 0, 13.33, 1.3, fill=RGBColor(0x1A, 0x0F, 0x35))
add_text(slide, "BOUTIQUE MANAGEMENT", 0.4, 0.12, 8, 0.32,
         size=10, bold=True, color=ROSE, font_name="Calibri")
add_text(slide, "Your Data is Always Safe", 0.4, 0.48, 12, 0.65,
         size=30, bold=True, color=WHITE, font_name="Calibri")

safety_items = [
    ("🗑️", "Nothing is Ever Lost",
     "Soft Delete Protection",
     "When you delete an order, measurement or bill, it is NOT permanently removed. "
     "It moves to a safe trash area. This means accidental deletes can always be recovered."),
    ("🔒", "Your Data Belongs Only to You",
     "Complete Data Isolation",
     "Your boutique's data is fully separate from every other boutique on the platform. "
     "No other boutique can ever see your orders, customers or billing information."),
    ("📱", "Works on Any Device",
     "Mobile-First, Always Available",
     "Log in from your phone, tablet or computer. Your data syncs in real time across "
     "all devices — check orders from your phone while someone else uses a tablet."),
    ("☁️", "Automatic Cloud Backup",
     "Powered by Google Firebase",
     "All data is stored on Google's Firebase cloud — the same infrastructure used by "
     "millions of apps. Automatic daily backups so your data is never at risk."),
]

for i, (icon, title, subtitle, desc) in enumerate(safety_items):
    row = i // 2
    col = i % 2
    x = 0.4 + col * 6.55
    y = 1.45 + row * 2.85

    add_rect(slide, x, y, 6.2, 2.6, fill=WHITE)
    add_rect(slide, x, y, 6.2, 0.08, fill=VIOLET if i < 2 else ROSE)

    add_text(slide, icon, x+0.2, y+0.2, 0.7, 0.6, size=28, font_name="Calibri")
    add_text(slide, title, x+1.0, y+0.18, 4.9, 0.35, size=13, bold=True, color=DARK, font_name="Calibri")
    add_text(slide, subtitle, x+1.0, y+0.55, 4.9, 0.28, size=10, bold=True,
             color=VIOLET if i < 2 else ROSE, font_name="Calibri")
    add_text(slide, desc, x+0.2, y+0.92, 5.8, 1.4, size=10.5, color=MUTED, font_name="Calibri")

# ══════════════════════════════════════════════════════════════════
# SLIDE 10 ─ GETTING STARTED / CALL TO ACTION
# ══════════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(blank_layout)
add_rect(slide, 0, 0, 13.33, 7.5, fill=DARK)

# Background blobs
c = slide.shapes.add_shape(9, Inches(8), Inches(-1), Inches(6), Inches(6))
c.fill.solid(); c.fill.fore_color.rgb = RGBColor(0x3D,0x20,0x70); c.line.fill.background()
c2 = slide.shapes.add_shape(9, Inches(-2), Inches(4.5), Inches(5), Inches(5))
c2.fill.solid(); c2.fill.fore_color.rgb = RGBColor(0x7A,0x2A,0x55); c2.line.fill.background()

# Header
add_text(slide, "BOUTIQUE MANAGEMENT", 0.6, 0.4, 10, 0.4,
         size=11, bold=True, color=ROSE, font_name="Calibri")
add_text(slide, "Ready to Get Started?", 0.6, 0.85, 10, 0.9,
         size=40, bold=True, color=WHITE, font_name="Calibri")

add_text(slide, "3 simple steps to transform how you run your boutique",
         0.6, 1.85, 10, 0.45, size=16, color=RGBColor(0xC0,0xB0,0xD8), font_name="Calibri")

# Steps
steps = [
    ("01", "We Set Up Your Account",   "We create your boutique profile and configure everything for you. No technical work on your side."),
    ("02", "Invite Your Team",          "Add your staff members by their phone number. They log in and are ready to go in minutes."),
    ("03", "Start Managing",            "Create your first order, add customer measurements, and generate your first invoice today."),
]

for i, (num, title, desc) in enumerate(steps):
    x = 0.6 + i * 4.25
    # Number circle
    circle = slide.shapes.add_shape(9, Inches(x), Inches(2.6), Inches(0.8), Inches(0.8))
    circle.fill.solid()
    circle.fill.fore_color.rgb = VIOLET if i == 0 else (BLUE if i == 1 else ROSE)
    circle.line.fill.background()
    add_text(slide, num, x, 2.6, 0.8, 0.8, size=16, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, font_name="Calibri")

    add_text(slide, title, x, 3.55, 3.8, 0.42, size=14, bold=True, color=WHITE, font_name="Calibri")
    add_text(slide, desc,  x, 4.05, 3.8, 1.2, size=11, color=RGBColor(0xC0,0xB0,0xD8), font_name="Calibri")

# Bottom CTA
add_rect(slide, 1.5, 5.5, 10.3, 1.5, fill=RGBColor(0x2A,0x18,0x45))
add_rect(slide, 1.5, 5.5, 10.3, 0.06, fill=ROSE)

add_text(slide, "Start with the FREE plan today — no credit card required",
         1.8, 5.62, 9.7, 0.45, size=15, bold=True, color=WHITE, align=PP_ALIGN.CENTER, font_name="Calibri")
add_text(slide, "Upgrade anytime as your boutique grows  ·  Cancel anytime  ·  Your data is always yours",
         1.8, 6.1, 9.7, 0.4, size=11, color=RGBColor(0xC0,0xB0,0xD8), align=PP_ALIGN.CENTER, font_name="Calibri")

add_text(slide, "Contact us to set up your boutique  ·  boutique-management.in",
         0.4, 7.1, 12.5, 0.35, size=10, color=MUTED, align=PP_ALIGN.CENTER, font_name="Calibri")

# ── Save ──────────────────────────────────────────────────────────
output = "/Applications/live projects/boutique-ecosystem/Boutique_Management_Subscription_Plans.pptx"
prs.save(output)
print(f"✅  Saved → {output}")
