import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import type { Vehicle } from "../api/types";

const STEPS = ["Customer", "Vehicle", "Rental", "Payment", "Inspection", "Signatures"];

export default function NewAgreement() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // File state
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [licenceFrontFile, setLicenceFrontFile] = useState<File | null>(null);
  const [licenceBackFile, setLicenceBackFile] = useState<File | null>(null);

  // Form state
  const [form, setForm] = useState({
    hireName: "",
    fatherName: "",
    mobile: "",
    licenceNo: "",
    address: "",
    carModel: "",
    carReg: "",
    startDate: "",
    reportingTime: "",
    returnDate: "",
    returnTime: "",
    endTime: "",
    startKm: "",
    endKm: "",
    fuelStart: "",
    fuelEnd: "",
    rentalAmount: "",
    securityDeposit: "",
    paymentMode: "Cash",
    paymentStatus: "Pending",
    notes: "",
    witnessName: "",
    customerSignature: "",
    witnessSignature: "",
  });

  // Vehicle list from DB
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const customerCanvasRef = useRef<HTMLCanvasElement>(null);
  const witnessCanvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch vehicles on mount
  useEffect(() => {
    client
      .get("/vehicles")
      .then((res) => setVehicles(res.data))
      .catch(console.error)
      .finally(() => setLoadingVehicles(false));
  }, []);

  // Auto-fill when vehicle is selected
  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const vehicle = vehicles.find((v) => v._id === vehicleId);
    if (vehicle) {
      setForm((prev) => ({
        ...prev,
        carModel: vehicle.modelName,
        carReg: vehicle.registration,
        rentalAmount: vehicle.ratePerDay ? String(vehicle.ratePerDay) : prev.rentalAmount,
      }));
    }
  };

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setupCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.clientWidth * 2;
    canvas.height = 360;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    let drawing = false;

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      drawing = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drawing) return;
      const p = getPos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const onUp = () => { drawing = false; };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
  };

  const clearCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Get signatures
      if (customerCanvasRef.current) {
        form.customerSignature = customerCanvasRef.current.toDataURL("image/png");
      }
      if (witnessCanvasRef.current) {
        form.witnessSignature = witnessCanvasRef.current.toDataURL("image/png");
      }

      // Create FormData for file uploads
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add files if selected
      if (aadhaarFile) formData.append("aadhaar", aadhaarFile);
      if (licenceFrontFile) formData.append("licenceFront", licenceFrontFile);
      if (licenceBackFile) formData.append("licenceBack", licenceBackFile);

      await client.post("/agreements", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/agreements");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create agreement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">KOTA CAZ RENTALS</span>
          <h1>New Agreement</h1>
        </div>
      </header>

      {error && <div className="flash error">{error}</div>}

      <div className="wizard-steps">
        {STEPS.map((s, i) => (
          <button
            key={i}
            className={`step ${step === i + 1 ? "active" : ""}`}
            onClick={() => setStep(i + 1)}
            type="button"
          >
            {i + 1} {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Customer */}
        {step === 1 && (
          <div className="panel step-panel">
            <h2>Customer Details</h2>
            <div className="form-grid two">
              <div className="form-group">
                <label>Hire Name *</label>
                <input
                  type="text"
                  value={form.hireName}
                  onChange={(e) => updateForm("hireName", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Father's Name</label>
                <input
                  type="text"
                  value={form.fatherName}
                  onChange={(e) => updateForm("fatherName", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Mobile *</label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => updateForm("mobile", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Licence Number</label>
                <input
                  type="text"
                  value={form.licenceNo}
                  onChange={(e) => updateForm("licenceNo", e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) => updateForm("address", e.target.value)}
              />
            </div>
            <h3>ID & Driving Licence</h3>
            <div className="form-grid three">
              <div className="form-group">
                <label>Aadhaar / ID</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                />
                {aadhaarFile && (
                  <small className="file-name">✓ {aadhaarFile.name}</small>
                )}
              </div>
              <div className="form-group">
                <label>Licence Front</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setLicenceFrontFile(e.target.files?.[0] || null)}
                />
                {licenceFrontFile && (
                  <small className="file-name">✓ {licenceFrontFile.name}</small>
                )}
              </div>
              <div className="form-group">
                <label>Licence Back</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setLicenceBackFile(e.target.files?.[0] || null)}
                />
                {licenceBackFile && (
                  <small className="file-name">✓ {licenceBackFile.name}</small>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle */}
        {step === 2 && (
          <div className="panel step-panel">
            <h2>Vehicle</h2>
            <div className="form-group">
              <label>Select Vehicle *</label>
              {loadingVehicles ? (
                <p className="loading">Loading vehicles...</p>
              ) : vehicles.length === 0 ? (
                <div className="flash" style={{ background: "#fff8e1", color: "#8a6d00" }}>
                  No vehicles found. Please add vehicles first from the Vehicles page.
                </div>
              ) : (
                <select
                  value={selectedVehicleId}
                  onChange={(e) => handleVehicleSelect(e.target.value)}
                  required
                >
                  <option value="">-- Choose a vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id} disabled={v.status !== "Available"}>
                      {v.modelName} ({v.registration}) - {v.status} {v.status !== "Available" ? "[Unavailable]" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {selectedVehicleId && (() => {
              const v = vehicles.find((x) => x._id === selectedVehicleId);
              if (!v) return null;
              return (
                <div className="vehicle-preview">
                  <div className="vehicle-preview-row">
                    <span><b>Model:</b> {v.modelName}</span>
                    <span><b>Registration:</b> {v.registration}</span>
                    <span><b>Type:</b> {v.vehicleType || "-"}</span>
                    <span><b>Fuel:</b> {v.fuelType}</span>
                    <span><b>Rate/Day:</b> ₹{v.ratePerDay.toLocaleString()}</span>
                    <span><b>Status:</b> {v.status}</span>
                  </div>
                </div>
              );
            })()}
            <div className="form-grid two" style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <label>Car Model (auto-filled)</label>
                <input
                  type="text"
                  value={form.carModel}
                  onChange={(e) => updateForm("carModel", e.target.value)}
                  placeholder="Select a vehicle above"
                />
              </div>
              <div className="form-group">
                <label>Car Registration (auto-filled)</label>
                <input
                  type="text"
                  value={form.carReg}
                  onChange={(e) => updateForm("carReg", e.target.value)}
                  placeholder="Select a vehicle above"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Rental */}
        {step === 3 && (
          <div className="panel step-panel">
            <h2>Rental</h2>
            <div className="form-grid three">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateForm("startDate", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Reporting Time</label>
                <input
                  type="time"
                  value={form.reportingTime}
                  onChange={(e) => updateForm("reportingTime", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Expected Return Date</label>
                <input
                  type="date"
                  value={form.returnDate}
                  onChange={(e) => updateForm("returnDate", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Return Time</label>
                <input
                  type="time"
                  value={form.returnTime}
                  onChange={(e) => updateForm("returnTime", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => updateForm("endTime", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Start KM</label>
                <input
                  type="text"
                  value={form.startKm}
                  onChange={(e) => updateForm("startKm", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End KM</label>
                <input
                  type="text"
                  value={form.endKm}
                  onChange={(e) => updateForm("endKm", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Fuel at Start</label>
                <input
                  type="text"
                  value={form.fuelStart}
                  onChange={(e) => updateForm("fuelStart", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Fuel at Return</label>
                <input
                  type="text"
                  value={form.fuelEnd}
                  onChange={(e) => updateForm("fuelEnd", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="panel step-panel">
            <h2>Payment</h2>
            <div className="form-grid two">
              <div className="form-group">
                <label>Rental Amount (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.rentalAmount}
                  onChange={(e) => updateForm("rentalAmount", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Security Deposit (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.securityDeposit}
                  onChange={(e) => updateForm("securityDeposit", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Payment Mode</label>
                <select
                  value={form.paymentMode}
                  onChange={(e) => updateForm("paymentMode", e.target.value)}
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <div className="form-group">
                <label>Payment Status</label>
                <select
                  value={form.paymentStatus}
                  onChange={(e) => updateForm("paymentStatus", e.target.value)}
                >
                  <option>Pending</option>
                  <option>Part Paid</option>
                  <option>Paid</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Inspection */}
        {step === 5 && (
          <div className="panel step-panel">
            <h2>Inspection / Notes</h2>
            <div className="form-group">
              <label>
                Existing damage / inspection notes
              </label>
              <textarea
                rows={6}
                value={form.notes}
                onChange={(e) => updateForm("notes", e.target.value)}
                placeholder="Mention scratches, dents, tyre condition, fuel, accessories, etc."
              />
            </div>
          </div>
        )}

        {/* Step 6: Signatures */}
        {step === 6 && (
          <div className="panel step-panel">
            <h2>Signatures</h2>
            <div className="form-grid two">
              <div>
                <label>Hirer Signature</label>
                <canvas
                  ref={(canvas) => {
                    if (canvas) {
                      customerCanvasRef.current = canvas;
                      setupCanvas(canvas);
                    }
                  }}
                  className="signature-canvas"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() =>
                    customerCanvasRef.current &&
                    clearCanvas(customerCanvasRef.current)
                  }
                >
                  Clear
                </button>
              </div>
              <div>
                <label>Witness Signature</label>
                <canvas
                  ref={(canvas) => {
                    if (canvas) {
                      witnessCanvasRef.current = canvas;
                      setupCanvas(canvas);
                    }
                  }}
                  className="signature-canvas"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() =>
                    witnessCanvasRef.current &&
                    clearCanvas(witnessCanvasRef.current)
                  }
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label>Witness Name</label>
              <input
                type="text"
                value={form.witnessName}
                onChange={(e) => updateForm("witnessName", e.target.value)}
              />
            </div>
            <div className="terms-box">
              <b>Confirmation</b>
              <br />
              I have read the terms and conditions and agree to the liabilities
              and conditions of the rental agreement.
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="nav-buttons">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
          >
            ← Back
          </button>
          {step < 6 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep(step + 1)}
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Agreement →"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
