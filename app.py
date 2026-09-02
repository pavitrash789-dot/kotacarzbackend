import os
import sqlite3
import base64
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, send_file, flash

APP_DIR = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(APP_DIR, "kota_caz.db")
UPLOADS = os.path.join(APP_DIR, "uploads")
GENERATED = os.path.join(APP_DIR, "generated")

os.makedirs(UPLOADS, exist_ok=True)
os.makedirs(GENERATED, exist_ok=True)

app = Flask(__name__)
app.secret_key = "change-this-secret-key"

def db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS agreements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agreement_no TEXT UNIQUE,
            hire_name TEXT NOT NULL,
            father_name TEXT,
            mobile TEXT NOT NULL,
            address TEXT,
            licence_no TEXT,
            car_reg TEXT,
            car_model TEXT,
            start_date TEXT,
            reporting_time TEXT,
            return_date TEXT,
            return_time TEXT,
            end_time TEXT,
            rental_amount REAL DEFAULT 0,
            security_deposit REAL DEFAULT 0,
            payment_mode TEXT,
            payment_status TEXT,
            start_km TEXT,
            end_km TEXT,
            fuel_start TEXT,
            fuel_end TEXT,
            notes TEXT,
            customer_signature TEXT,
            witness_name TEXT,
            witness_signature TEXT,
            created_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model TEXT NOT NULL,
            registration TEXT UNIQUE NOT NULL,
            vehicle_type TEXT,
            fuel_type TEXT,
            rate_per_day REAL DEFAULT 0,
            status TEXT DEFAULT 'Available',
            notes TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_upload(file_obj, agreement_no, label):
    if not file_obj or not file_obj.filename:
        return ""
    safe_name = os.path.basename(file_obj.filename).replace(" ", "_")
    filename = f"{agreement_no}_{label}_{safe_name}"
    path = os.path.join(UPLOADS, filename)
    file_obj.save(path)
    return path

def save_signature(data_url, agreement_no, label):
    if not data_url or "," not in data_url:
        return ""
    try:
        raw = base64.b64decode(data_url.split(",", 1)[1])
        path = os.path.join(UPLOADS, f"{agreement_no}_{label}.png")
        with open(path, "wb") as f:
            f.write(raw)
        return path
    except Exception:
        return ""

@app.route("/")
def dashboard():
    conn = db()
    agreements = conn.execute("SELECT * FROM agreements ORDER BY id DESC LIMIT 10").fetchall()
    total = conn.execute("SELECT COUNT(*) FROM agreements").fetchone()[0]
    available = conn.execute("SELECT COUNT(*) FROM vehicles WHERE status='Available'").fetchone()[0]
    out = conn.execute("SELECT COUNT(*) FROM vehicles WHERE status!='Available'").fetchone()[0]
    deposits = conn.execute("SELECT COALESCE(SUM(security_deposit),0) FROM agreements").fetchone()[0]
    vehicles = conn.execute("SELECT * FROM vehicles ORDER BY id DESC").fetchall()
    conn.close()
    return render_template("dashboard.html", agreements=agreements, total=total,
                           available=available, out=out, deposits=deposits, vehicles=vehicles)

@app.route("/agreements/new", methods=["GET", "POST"])
def new_agreement():
    if request.method == "POST":
        f = request.form
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        agreement_no = "KC-" + datetime.now().strftime("%Y%m%d-%H%M%S")

        conn = db()
        conn.execute("""
            INSERT INTO agreements (
                agreement_no, hire_name, father_name, mobile, address, licence_no,
                car_reg, car_model, start_date, reporting_time, return_date,
                return_time, end_time, rental_amount, security_deposit,
                payment_mode, payment_status, start_km, end_km, fuel_start,
                fuel_end, notes, customer_signature, witness_name,
                witness_signature, created_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            agreement_no, f.get("hire_name"), f.get("father_name"), f.get("mobile"),
            f.get("address"), f.get("licence_no"), f.get("car_reg"), f.get("car_model"),
            f.get("start_date"), f.get("reporting_time"), f.get("return_date"),
            f.get("return_time"), f.get("end_time"), f.get("rental_amount") or 0,
            f.get("security_deposit") or 0, f.get("payment_mode"), f.get("payment_status"),
            f.get("start_km"), f.get("end_km"), f.get("fuel_start"), f.get("fuel_end"),
            f.get("notes"), "", f.get("witness_name"), "", now
        ))
        conn.commit()
        agreement_id = conn.execute("SELECT id FROM agreements WHERE agreement_no=?", (agreement_no,)).fetchone()[0]
        conn.close()

        save_upload(request.files.get("aadhaar"), agreement_no, "aadhaar")
        save_upload(request.files.get("licence_front"), agreement_no, "licence_front")
        save_upload(request.files.get("licence_back"), agreement_no, "licence_back")

        customer_sig = save_signature(f.get("customer_signature"), agreement_no, "customer_signature")
        witness_sig = save_signature(f.get("witness_signature"), agreement_no, "witness_signature")

        conn = db()
        conn.execute("UPDATE agreements SET customer_signature=?, witness_signature=? WHERE id=?",
                     (customer_sig, witness_sig, agreement_id))
        conn.commit()
        conn.close()

        flash("Agreement created successfully.", "success")
        return redirect(url_for("agreement_pdf", agreement_id=agreement_id))

    return render_template("new_agreement.html")

@app.route("/vehicles", methods=["GET", "POST"])
def vehicles():
    conn = db()
    if request.method == "POST":
        f = request.form
        try:
            conn.execute("""
                INSERT INTO vehicles(model, registration, vehicle_type, fuel_type, rate_per_day, status, notes)
                VALUES(?,?,?,?,?,?,?)
            """, (f.get("model"), f.get("registration"), f.get("vehicle_type"),
                  f.get("fuel_type"), f.get("rate_per_day") or 0,
                  f.get("status") or "Available", f.get("notes")))
            conn.commit()
            flash("Vehicle added.", "success")
        except sqlite3.IntegrityError:
            flash("Registration number already exists.", "error")
        return redirect(url_for("vehicles"))
    rows = conn.execute("SELECT * FROM vehicles ORDER BY id DESC").fetchall()
    conn.close()
    return render_template("vehicles.html", vehicles=rows)

@app.route("/agreements")
def agreements():
    q = request.args.get("q", "").strip()
    conn = db()
    if q:
        rows = conn.execute("""
            SELECT * FROM agreements
            WHERE hire_name LIKE ? OR mobile LIKE ? OR car_reg LIKE ? OR agreement_no LIKE ?
            ORDER BY id DESC
        """, (f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%")).fetchall()
    else:
        rows = conn.execute("SELECT * FROM agreements ORDER BY id DESC").fetchall()
    conn.close()
    return render_template("agreements.html", agreements=rows, q=q)

@app.route("/agreement/<int:agreement_id>/pdf")
def agreement_pdf(agreement_id):
    conn = db()
    a = conn.execute("SELECT * FROM agreements WHERE id=?", (agreement_id,)).fetchone()
    conn.close()
    if not a:
        return "Agreement not found", 404

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
        from reportlab.lib.units import mm

        out = os.path.join(GENERATED, f"{a['agreement_no']}.pdf")
        doc = SimpleDocTemplate(out, pagesize=A4, rightMargin=16*mm, leftMargin=16*mm,
                                topMargin=14*mm, bottomMargin=14*mm)
        styles = getSampleStyleSheet()
        title = ParagraphStyle("Title2", parent=styles["Title"], fontSize=15, alignment=TA_CENTER, spaceAfter=5)
        center = ParagraphStyle("Center", parent=styles["Normal"], alignment=TA_CENTER, fontSize=9)
        body = ParagraphStyle("Body2", parent=styles["BodyText"], fontSize=8.7, leading=12)
        heading = ParagraphStyle("Heading2x", parent=styles["Heading2"], fontSize=10, leading=13, spaceBefore=7, spaceAfter=4)

        story = [
            Paragraph("KOTA CARZ SELF DRIVE KOTA", title),
            Paragraph("RENTAL AGREEMENT", ParagraphStyle("sub", parent=title, fontSize=12)),
            Paragraph("AGREEMENT FOR CAR HIRE (SELF DRIVE) BETWEEN HIRE AND OWNER", center),
            Spacer(1, 8),
            Paragraph(f"This document is drafted as a binding agreement between the hirer and the owner. Agreement No.: <b>{a['agreement_no']}</b>", body),
            Spacer(1, 5),
            Paragraph("Vehicle description and term hire", heading),
        ]

        data = [
            ["Hire Name", a["hire_name"] or "", "Father's Name", a["father_name"] or ""],
            ["Mobile No.", a["mobile"] or "", "Licence No.", a["licence_no"] or ""],
            ["Address", a["address"] or "", "", ""],
            ["Car Reg Number", a["car_reg"] or "", "Car Model", a["car_model"] or ""],
            ["Start Date", a["start_date"] or "", "Reporting Time", a["reporting_time"] or ""],
            ["Expected Return", a["return_date"] or "", "Time", a["return_time"] or ""],
            ["End Time", a["end_time"] or "", "Start KM", a["start_km"] or ""],
            ["End KM", a["end_km"] or "", "Fuel Start/End", f"{a['fuel_start'] or ''} / {a['fuel_end'] or ''}"],
        ]
        t = Table(data, colWidths=[30*mm, 58*mm, 30*mm, 58*mm])
        t.setStyle(TableStyle([
            ("GRID",(0,0),(-1,-1),0.35,colors.grey),
            ("FONTNAME",(0,0),(-1,-1),"Helvetica"),
            ("FONTNAME",(0,0),(0,-1),"Helvetica-Bold"),
            ("FONTNAME",(2,0),(2,-1),"Helvetica-Bold"),
            ("FONTSIZE",(0,0),(-1,-1),8),
            ("VALIGN",(0,0),(-1,-1),"TOP"),
            ("LEFTPADDING",(0,0),(-1,-1),4),
            ("RIGHTPADDING",(0,0),(-1,-1),4),
        ]))
        story += [t, Spacer(1, 7), Paragraph("Payment by Hire", heading)]
        story += [Paragraph(
            f"The Hirer must pay the operator the sums specified in this agreement. Rental amount: "
            f"<b>INR {float(a['rental_amount'] or 0):,.2f}</b>. Security deposit: "
            f"<b>INR {float(a['security_deposit'] or 0):,.2f}</b>. Payment mode: {a['payment_mode'] or '-'}; "
            f"payment status: {a['payment_status'] or '-'}. The security deposit may be applied toward "
            f"necessary repair/replacement costs and other amounts due under this agreement.", body)]

        story += [Paragraph("Representation and Warranties", heading),
                  Paragraph(
            "Owner represents and warrants that, to the owner's knowledge, the rental vehicle is in good "
            "condition and safe for ordinary operation. The hirer represents that the hirer is legally "
            "entitled to operate a motor vehicle under applicable law and will not operate it in violation "
            "of law or in a negligent or illegal manner. The hirer has an opportunity to examine the rental "
            "vehicle before taking possession and is responsible for damage occurring during the hire period "
            "except damage noted in the separate existing-damage document.", body),
                  Paragraph("Jurisdiction and Venue", heading),
                  Paragraph(
            "In the event of a dispute over this agreement, it will be interpreted according to the applicable "
            "laws of the State of Rajasthan, with Kota as the agreed venue, subject to applicable law.", body),
                  PageBreak(),
                  Paragraph("Entire Agreement", heading),
                  Paragraph(
            "This Car Rental Agreement constitutes the entire agreement between the parties with respect to "
            "this rental agreement. Modification can be made only in writing and signed by the parties.", body),
                  Paragraph("NOTE", heading),
                  Paragraph(
            "If you want to return the car before the end time of your rental period, no amount will be refunded "
            "unless otherwise agreed. If you need an extra day, contact the rental team before the scheduled "
            "return time and ask whether the vehicle is available.", body),
                  Paragraph("SCHEDULE OF CHARGES AND TERMS AND CONDITIONS FOR VEHICLE ON SELF DRIVE BASIS", heading)]

        terms = [
            "1. Driving above the mentioned maximum speed of 80 km/hr: fine of INR 2500.",
            "2. Tyre misuse or damage resulting from bad terrain/continued driving after a puncture: actual tyre cost may be charged.",
            "3. Traffic violation: INR 1000 in addition to the actual fine charged.",
            "4. Unauthorized activities such as carrying arms/ammunition or intoxication: INR 15000 penalty.",
            "5. Tampering with GPS, speed governor or similar devices: INR 15000 plus actual repair/fitment cost.",
            "6. Delay in returning the car: INR 300 per hour over the agreed hour rate; after extension, INR 500 per day may apply.",
            "7. Extension beyond scheduled time must be informed in advance and is subject to availability; otherwise a whole-day charge may apply.",
            "8. Unclean car: INR 500 for minor cleaning and INR 1500 for major cleaning.",
            "9. Failure to return original documents: INR 5000 plus actual documentation charges.",
            "10. Driving under the influence of alcohol/drugs or while suffering from a condition that makes driving unsafe may result in forfeiture of the security deposit plus actual damage costs.",
            "11. Intentional damage, continuing to drive after an accident, or extreme/rash driving is prohibited and may result in liability for damage.",
            "12. Carrying more persons than legally permitted: INR 5000 penalty, plus liability for resulting legal action.",
            "13. Carrying any animal illegally: INR 20000 penalty.",
            "14. Smoking: INR 1000 plus applicable interior damage charges.",
            "15. Carrying passengers or goods for consideration/reward, whether expressed or implied, is prohibited.",
            "16. Vehicle may be supplied with limited fuel as agreed. Fuel shortage on return may be charged at the applicable fuel rate.",
            "17. Damage repair charges will be based on authorized service-center estimates. Insurance treatment is subject to the applicable policy and circumstances.",
            "18. Security amount will normally be returned within 3 to 7 working days, subject to resolution of issues and applicable deductions.",
            "19. Early return does not automatically entitle the hirer to a refund or adjustment unless agreed in writing.",
            "20. Indicative fixed damage charges: minimum scratch INR 1000; dent/panel paint work INR 4000; bumper damage INR 8000; wheel cap missing INR 500; side mirror INR 5000; running board INR 2000; number plate INR 500; tail lamp INR 3000; tyre damage INR 5000; tyre puncture INR 200.",
            "21. Repairing the car without permission of the operator may attract a penalty of INR 10000."
        ]
        for term in terms:
            story.append(Paragraph(term, body))
            story.append(Spacer(1, 2))

        story += [
            Spacer(1, 8),
            Paragraph("I have read carefully all terms and conditions above mentioned and I agree to the liability and terms and conditions.", body),
        ]
        sig_cells = []
        for label, path in [("Hirer Signature", a["customer_signature"]), ("Witness Signature", a["witness_signature"])]:
            if path and os.path.exists(path):
                img = Image(path, width=48*mm, height=18*mm)
                sig_cells.append([Paragraph(label, body), img])
            else:
                sig_cells.append([Paragraph(label, body), Paragraph("____________________", body)])
        sig_table = Table(sig_cells, colWidths=[45*mm, 70*mm], hAlign="LEFT")
        sig_table.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"MIDDLE"),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
        story += [Spacer(1, 8), sig_table]
        story += [
            Spacer(1, 6),
            Paragraph("Witness Name: " + (a["witness_name"] or "____________________"), body),
            Spacer(1, 6),
            Paragraph("Mobile: " + (a["mobile"] or "") + "    Date: " + (a["created_at"][:10] if a["created_at"] else ""), body),
            Spacer(1, 14),
            Paragraph("Hirer Thumb Print: ____________________    Witness Thumb Print: ____________________", body),
        ]

        doc.build(story)
        return send_file(out, as_attachment=True, download_name=os.path.basename(out))
    except ImportError:
        return "Install reportlab first: pip install reportlab", 500

if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5173)
