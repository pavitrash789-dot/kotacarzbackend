# Kota Caz Rentals – E-Agreement MVP

A local-first Python Flask application based on the supplied rental agreement and the supplied UI video.

## Included
- Dashboard with rental/vehicle counts
- New Agreement multi-section wizard
- Customer, vehicle, rental, payment and inspection fields
- Aadhaar/ID and licence upload
- On-screen customer + witness signatures
- SQLite database
- Searchable agreement history
- Vehicle management
- PDF generation with the 21 supplied terms/conditions

## Run on Mac / Windows

1. Install Python 3.11+.
2. Open Terminal/Command Prompt in this folder.
3. Create a virtual environment:

   python3 -m venv .venv

4. Activate it:

   Mac/Linux:
   source .venv/bin/activate

   Windows:
   .venv\Scripts\activate

5. Install packages:

   pip install -r requirements.txt

6. Start:

   python app.py

7. Open:

   http://127.0.0.1:5173

## Important
- Change `app.secret_key` before putting this online.
- Uploaded identity documents are sensitive. Do not expose the `uploads` folder publicly.
- This is a working MVP, not legal advice. Have the final agreement wording reviewed by your lawyer/authorized professional before using it as a binding e-agreement.
- For a production version, add authentication, encrypted storage, backups, audit logs, role permissions and secure document retention/deletion.
