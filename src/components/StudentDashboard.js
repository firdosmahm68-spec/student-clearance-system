"use client"

import { useState, useEffect } from "react"
import ClearanceForm from "./ClearanceForm"
import StatusTracker from "./StatusTracker"
import { getStudentRequests, getApprovalCount, generateCertificate } from "../services/api"
import jsPDF from "jspdf"

const StudentDashboard = ({ user }) => {
  const [requests, setRequests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [approvalCounts, setApprovalCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchRequests()

    // Set up interval to refresh data every 10 seconds
    const interval = setInterval(() => {
      if (!showForm) {
        fetchRequests()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [showForm])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await getStudentRequests()
      setRequests(response.data)

      // Fetch approval counts for each request
      const counts = {}
      for (const request of response.data) {
        const countResponse = await getApprovalCount(request._id)
        counts[request._id] = countResponse.data
      }
      setApprovalCounts(counts)
    } catch (error) {
      setError("Failed to fetch requests. Please try again.")
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewRequest = () => {
    setShowForm(true)
  }

  const handleFormSubmit = () => {
    setShowForm(false)
    fetchRequests()
  }

  const handleFormCancel = () => {
    setShowForm(false)
  }

  const handleDownloadCertificate = async (requestId) => {
    try {
      const response = await generateCertificate(requestId)
      const certificateData = response.data.certificate

      // Create PDF certificate
      const doc = new jsPDF()

      // Add background color
      doc.setFillColor(240, 240, 240)
      doc.rect(0, 0, 210, 297, "F")

      // Add border
      doc.setDrawColor(100, 100, 100)
      doc.setLineWidth(1)
      doc.rect(10, 10, 190, 277)

      try {
        // Add university logo
        const logoImg = new Image()
        logoImg.crossOrigin = "anonymous"
        logoImg.src = "/images/university-logo.jpg" // You'll need to add this image to your public/images folder

        // Wait for image to load
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve
          logoImg.onerror = reject
        })

        // Add the logo to PDF
        doc.addImage(logoImg, "PNG", 85, 20, 40, 40)
      } catch (error) {
        // Fallback to placeholder if image fails to load
        doc.setFillColor(200, 200, 200)
        doc.rect(85, 20, 40, 40, "F")
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text("University Logo", 105, 40, { align: "center" })
      }

      // Add title
      doc.setFontSize(24)
      doc.setTextColor(0, 0, 139) // Dark blue
      doc.setFont(undefined, "bold")
      doc.text("CLEARANCE CERTIFICATE", 105, 70, { align: "center" })

      // Add decorative line
      doc.setDrawColor(0, 0, 139)
      doc.setLineWidth(0.5)
      doc.line(50, 75, 160, 75)

      // Add certificate content
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, "normal")
      doc.text("This is to certify that", 105, 90, { align: "center" })

      // Student name
      doc.setFontSize(18)
      doc.setTextColor(0, 0, 139)
      doc.setFont(undefined, "bold")
      doc.text(certificateData.studentName, 105, 105, { align: "center" })

      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, "normal")
      doc.text(`Student ID: ${certificateData.studentId}`, 105, 120, { align: "center" })
      doc.text(`Program: ${certificateData.program}`, 105, 130, { align: "center" })
      doc.text(`Year: ${certificateData.year} | Semester: ${certificateData.semester}`, 105, 140, { align: "center" })

      doc.text("has successfully completed all clearance requirements", 105, 155, { align: "center" })
      doc.text("and is hereby granted this certificate of clearance.", 105, 165, { align: "center" })

      // Add approval date
      doc.text(`Approval Date: ${certificateData.approvalDate}`, 105, 185, { align: "center" })

      // Add request ID
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Request ID: ${certificateData.requestId}`, 105, 195, { align: "center" })

      // Add signature lines
      doc.setDrawColor(0, 0, 0)
      doc.line(40, 240, 80, 240)
      doc.line(130, 240, 170, 240)

      try {
        // Add dean signature image
        const deanSignatureImg = new Image()
        deanSignatureImg.crossOrigin = "anonymous"
        deanSignatureImg.src = "/images/dean-signature.jpg" // You'll need to add this image

        await new Promise((resolve, reject) => {
          deanSignatureImg.onload = resolve
          deanSignatureImg.onerror = reject
        })

        doc.addImage(deanSignatureImg, "PNG", 45, 220, 30, 15)
      } catch (error) {
        // Fallback to text if signature image fails
        doc.setFontSize(12)
        doc.text("Student Dean Signature", 60, 250, { align: "center" })
      }

      try {
        // Add university seal image
        const sealImg = new Image()
        sealImg.crossOrigin = "anonymous"
        sealImg.src = "/images/university-seal.jpg" // You'll need to add this image

        await new Promise((resolve, reject) => {
          sealImg.onload = resolve
          sealImg.onerror = reject
        })

        doc.addImage(sealImg, "PNG", 135, 220, 30, 15)
      } catch (error) {
        // Fallback to text if seal image fails
        doc.setFontSize(12)
        doc.text("University Seal", 150, 250, { align: "center" })
      }

      // Add footer
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      // doc.text('This certificate is electronically generated and does not require a physical signature.', 105, 270, { align: 'center' });

      // Save the PDF
      doc.save(`clearance-certificate-${certificateData.requestId}.pdf`)
    } catch (error) {
      setError("Failed to generate certificate. Please try again.")
      console.error("Error generating certificate:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Student Dashboard</h1>
            {!showForm && (
              <button onClick={handleNewRequest} className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>New Clearance Request
              </button>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {!showForm && requests.length === 0 && (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                <h3>No Clearance Requests</h3>
                <p className="text-muted">You don't have any clearance requests yet.</p>
                <button onClick={handleNewRequest} className="btn btn-primary mt-3">
                  Start Your First Clearance Request
                </button>
              </div>
            </div>
          )}

          {!showForm && requests.length > 0 && (
            <div>
              <h2 className="mb-4">Your Clearance Requests</h2>
              {requests.map((request) => (
                <div key={request._id} className="card mb-4">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Request #{request._id.slice(-6).toUpperCase()}</h5>
                    <span
                      className={`badge ${request.status === "approved" ? "bg-success" : request.status === "rejected" ? "bg-danger" : "bg-warning"} status-badge`}
                    >
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <p>
                          <strong>Reason:</strong> {request.reason}
                        </p>
                        <p>
                          <strong>Year/Semester:</strong> {request.year} / {request.semester}
                        </p>
                        <p>
                          <strong>Created:</strong> {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p>
                          <strong>Student ID:</strong> {request.studentId.studentId}
                        </p>
                        <p>
                          <strong>Program:</strong> {request.studentId.program}
                        </p>
                        <p>
                          <strong>Enrollment:</strong> {request.studentId.enrollmentType}
                        </p>
                      </div>
                    </div>

                    {approvalCounts[request._id] && (
                      <div className="approval-progress">
                        <h6>Approval Progress</h6>
                        <div className="progress mb-2">
                          <div
                            className={`progress-bar ${approvalCounts[request._id].percentage === 100 ? "bg-success" : "bg-primary"}`}
                            role="progressbar"
                            style={{ width: `${approvalCounts[request._id].percentage}%` }}
                            aria-valuenow={approvalCounts[request._id].approvedCount}
                            aria-valuemin="0"
                            aria-valuemax={approvalCounts[request._id].totalCount}
                          >
                            {approvalCounts[request._id].approvedCount}/{approvalCounts[request._id].totalCount}
                          </div>
                        </div>
                        <small className="text-muted">
                          {approvalCounts[request._id].percentage}% Complete •
                          {approvalCounts[request._id].approvedCount} of {approvalCounts[request._id].totalCount}{" "}
                          offices approved
                        </small>
                      </div>
                    )}

                    <StatusTracker request={request} />

                    {request.status === "approved" && (
                      <div className="mt-3">
                        <button className="btn btn-success" onClick={() => handleDownloadCertificate(request._id)}>
                          <i className="bi bi-download me-2"></i>Download Certificate (PDF)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showForm && <ClearanceForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} user={user} />}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
