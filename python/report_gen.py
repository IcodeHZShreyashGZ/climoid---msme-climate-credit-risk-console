import html
import json
import os
import sys
import time

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
import geopandas as gpd
from adjustText import adjust_text
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    Image as RLImage,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEOJSON = os.path.join(ROOT, "data", "india_states.geojson")
REPORTS_DIR = os.path.join(ROOT, "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

TEAL = "#00685f"
INK = "#0b1c30"
GREY = "#565e74"


def render_map(payload, png_path):
    india = gpd.read_file(GEOJSON)
    states = india[["st_nm", "geometry"]].dissolve(by="st_nm")

    fig, ax = plt.subplots(figsize=(10.5, 8))
    states.plot(ax=ax, color="#f0f4f2", edgecolor="#b7c4c0", linewidth=0.6)

    points = payload.get("points", [])
    texts = []
    for p in points:
        color = p.get("color", TEAL)
        is_region = p.get("kind") == "region"
        marker = "D" if is_region else "o"
        size = 130 if is_region else 80
        ax.scatter(
            p["lng"],
            p["lat"],
            s=size,
            c=color,
            marker=marker,
            edgecolors="white",
            linewidths=1.4,
            zorder=6,
        )
        label = p.get("label") or p.get("name") or ""
        texts.append(
            ax.text(
                p["lng"],
                p["lat"],
                label,
                fontsize=6.6,
                weight="bold",
                color=INK,
                zorder=7,
            )
        )
    if texts:
        adjust_text(
            texts,
            expand=(1.3, 1.6),
            arrowprops=dict(arrowstyle="-", color="#6d7a77", lw=0.5),
        )

    handles = []
    seen = set()
    for p in points:
        band = p.get("band")
        key = (band or "region", p.get("color", TEAL), p.get("kind", "borrower"))
        if key in seen:
            continue
        seen.add(key)
        marker = "D" if p.get("kind") == "region" else "o"
        legend_label = f"Band {band}" if band else str(p.get("name", "Region"))[:40]
        handles.append(
            Line2D(
                [0],
                [0],
                marker=marker,
                color="none",
                markerfacecolor=p.get("color", TEAL),
                markeredgecolor="white",
                markersize=8,
                label=legend_label,
            )
        )
    if handles:
        ax.legend(
            handles=handles,
            loc="lower left",
            fontsize=7,
            framealpha=0.92,
            title="Legend",
            title_fontsize=7.5,
        )

    ax.set_title(payload.get("title", "Climoid Report"), fontsize=13, weight="bold", color=INK)
    ax.set_xlabel("Longitude", fontsize=8, color=GREY)
    ax.set_ylabel("Latitude", fontsize=8, color=GREY)
    ax.tick_params(labelsize=7, colors=GREY)

    if points:
        lats = [p["lat"] for p in points]
        lngs = [p["lng"] for p in points]
        pad = 2.4
        ax.set_xlim(min(lngs) - pad, max(lngs) + pad)
        ax.set_ylim(min(lats) - pad, max(lats) + pad)

    fig.tight_layout()
    fig.savefig(png_path, dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def esc(s):
    return html.escape(str(s), quote=False)


def build_pdf(payload, png_path, pdf_path):
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=20, textColor=colors.HexColor(INK), spaceAfter=6)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=14, textColor=colors.HexColor(TEAL), spaceAfter=6)
    meta = ParagraphStyle("meta", parent=styles["Normal"], fontSize=9, textColor=colors.HexColor(GREY))
    body = ParagraphStyle("body", parent=styles["Normal"], fontSize=10, leading=14.5, alignment=TA_LEFT)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        title=payload.get("title", "Climoid Report"),
    )

    story = []
    story.append(Paragraph("CLIMOID — MSME Climate Credit Risk Console", meta))
    story.append(Spacer(1, 8))
    story.append(Paragraph(esc(payload.get("title", "Climoid Report")), h1))
    if payload.get("subtitle"):
        story.append(Paragraph(esc(payload["subtitle"]), styles["Heading3"]))
    story.append(
        Paragraph(
            f"Generated {esc(payload.get('generatedAt', ''))} · Map rendered with GeoPandas (India state boundaries) · "
            "Decision-support prototype — parameters are priors pending calibration on real outcome data.",
            meta,
        )
    )
    story.append(Spacer(1, 10))

    stats = payload.get("stats") or []
    if stats:
        tbl = Table([[esc(s) for s in stats]], colWidths=[178 * mm / len(stats)] * len(stats))
        tbl.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#e5eeff")),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#005049")),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )
        story.append(tbl)
        story.append(Spacer(1, 14))

    narrative = payload.get("narrative")
    if narrative:
        story.append(Paragraph("Committee Analysis", h2))
        story.append(Paragraph(esc(narrative).replace("\r", "").replace("\n", "<br/>"), body))

    if png_path and os.path.exists(png_path):
        story.append(PageBreak())
        story.append(Paragraph("Labeled Risk Map — GeoPandas Rendering", h2))
        story.append(Spacer(1, 6))
        iw, ih = ImageReader(png_path).getSize()
        w = 172 * mm
        h = w * ih / iw
        max_h = 238 * mm
        if h > max_h:
            h = max_h
            w = h * iw / ih
        story.append(RLImage(png_path, width=w, height=h))

    borrowers = payload.get("borrowers") or []
    if borrowers:
        story.append(PageBreak())
        story.append(Paragraph("Borrower Data", h2))
        story.append(Spacer(1, 4))
        header = ["MSME", "District", "Sector", "Base", "Climate", "Drag", "PD b→c", "Band", "Rev@Risk", "+bps"]
        rows = []
        for b in borrowers:
            rows.append(
                [
                    esc(str(b.get("name", ""))[:26]),
                    esc(b.get("district", "")),
                    esc(str(b.get("sector", ""))[:18]),
                    str(b.get("baseScore", "")),
                    str(b.get("climateScore", "")),
                    f"-{b.get('dragPoints', '')}",
                    f"{b.get('basePdPercent', '')}%→{b.get('adjustedPdPercent', '')}%",
                    str(b.get("riskBand", "")),
                    f"{b.get('revenueAtRiskCr', '')}Cr",
                    f"+{b.get('spreadAdjustmentBps', '')}",
                ]
            )
        col_widths = [42, 24, 28, 13, 15, 13, 20, 11, 18, 12]
        scale = 178 * mm / sum(col_widths)
        tbl = Table([header] + rows, colWidths=[c * scale for c in col_widths], repeatRows=1)
        style = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(TEAL)),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 7.5),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#d5dcd9")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]
        for i in range(len(rows)):
            if i % 2 == 1:
                style.append(("BACKGROUND", (0, i + 1), (-1, i + 1), colors.HexColor("#f8f9ff")))
        tbl.setStyle(TableStyle(style))
        story.append(tbl)
    else:
        regions = [p for p in payload.get("points", []) if p.get("verdict")]
        if regions:
            story.append(PageBreak())
            story.append(Paragraph("Region Comparison", h2))
            story.append(Spacer(1, 4))
            header = ["Region", "Climate-credit verdict"]
            rows = [[esc(r.get("name", "")), esc(r.get("verdict", ""))] for r in regions]
            tbl = Table([header] + rows, colWidths=[45 * mm, 133 * mm], repeatRows=1)
            tbl.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(TEAL)),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#d5dcd9")),
                        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                        ("TOPPADDING", (0, 0), (-1, -1), 5),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ]
                )
            )
            story.append(tbl)

    doc.build(story)


def main():
    try:
        payload = json.load(sys.stdin)
        report_id = payload.get("reportId") or f"rpt-{int(time.time())}"
        pdf_path = os.path.join(REPORTS_DIR, f"{report_id}.pdf")
        png_path = os.path.join(REPORTS_DIR, f"{report_id}_map.png")

        if payload.get("points"):
            render_map(payload, png_path)
            build_pdf(payload, png_path, pdf_path)
        else:
            build_pdf(payload, None, pdf_path)

        print(json.dumps({"ok": True, "filename": f"{report_id}.pdf"}))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
