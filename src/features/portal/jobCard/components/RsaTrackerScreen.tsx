import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Linking
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRsaRequestDetails, useRsaInvoice } from '../hooks/useJobCards';
import { useQueryClient } from '@tanstack/react-query';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface RsaTrackerScreenProps {
  requestId: string;
  onBack: () => void;
}

export const RsaTrackerScreen: React.FC<RsaTrackerScreenProps> = ({
  requestId,
  onBack,
}) => {
  const queryClient = useQueryClient();
  const { data: request, isLoading, error, refetch: refetchRequest } = useRsaRequestDetails(requestId);
  const { data: invoice, isLoading: loadingInvoice, refetch: refetchInvoice } = useRsaInvoice(requestId);
  
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Compute status conditions matching ERP LifecycleTracker
  const status = (request?.status || 'requested').toLowerCase();
  const assignment = request?.assignments?.[0];

  const isAssigned = Boolean(assignment || ['assigned', 'en_route', 'on_site', 'resolved', 'towed', 'job_card_created', 'closed'].includes(status));
  const isAccepted = Boolean((assignment && assignment.status === 'accepted') || ['en_route', 'on_site', 'resolved', 'towed', 'job_card_created', 'closed'].includes(status));
  const isEnroute = Boolean(['en_route', 'on_site', 'resolved', 'towed', 'job_card_created', 'closed'].includes(status));
  const isResolved = Boolean(request?.resolvedAt || ['resolved', 'towed', 'closed'].includes(status));
  const isBilled = Boolean(invoice);
  const isPaid = Boolean(invoice && (invoice.status.toLowerCase() === 'paid' || invoice.paymentStatus?.toLowerCase() === 'paid'));
  const isClosed = Boolean(request?.closedAt || status === 'closed');

  // Compute current active step (1 to 8)
  const getActiveRsaStep = (): number => {
    if (isClosed) return 8; // Closed
    if (isPaid) return 8; // Advance to Step 8 if paid
    if (isBilled) return 7; // Active step is 7 (Paid) if billed
    if (isResolved) return 6; // Active step is 6 (Billed) if resolved
    if (isEnroute) return 5; // Active step is 5 (Resolved) if enroute
    if (isAccepted) return 4; // Active step is 4 (Enroute) if accepted
    if (isAssigned) return 3; // Active step is 3 (Accepted) if assigned
    return 2; // Active step is 2 (Assigned) if requested
  };

  const currentStep = getActiveRsaStep();

  // Set initial expanded step to current active step
  useEffect(() => {
    if (currentStep) {
      setExpandedStep(currentStep);
    }
  }, [currentStep]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Loading tracking details...</Text>
      </View>
    );
  }

  if (error || !request) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-triangle" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Failed to load status</Text>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'Please check your connection or try again later.'}
        </Text>
        <TouchableOpacity style={styles.errorBackButton} onPress={onBack}>
          <Text style={styles.errorBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['portal', 'rsaRequests'] });
      await queryClient.invalidateQueries({ queryKey: ['portal', 'customer', 'dashboard'] });
      await Promise.all([
        refetchRequest(),
        refetchInvoice()
      ]);
    } catch (err) {
      console.error("Error syncing RSA status:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCallTechnician = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      alert('Could not launch phone call application.');
    });
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '--:--';
    }
  };

  const numberToWords = (num: number) => {
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertThousands = (n: number): string => {
      if (n < 20) return a[n];
      const digit = n % 10;
      if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
      const hundredPart = a[Math.floor(n / 100)] + ' Hundred';
      const tenPart = n % 100;
      return hundredPart + (tenPart ? ' and ' + convertThousands(tenPart) : '');
    };

    const convertLakhs = (n: number): string => {
      if (n < 1000) return convertThousands(n);
      if (n < 100000) {
        const thousandPart = convertThousands(Math.floor(n / 1000)) + ' Thousand';
        const restPart = n % 1000;
        return thousandPart + (restPart ? ' ' + convertThousands(restPart) : '');
      }
      const lakhPart = convertThousands(Math.floor(n / 100000)) + ' Lakh';
      const restPart = n % 100000;
      return lakhPart + (restPart ? ' ' + convertLakhs(restPart) : '');
    };

    const intPart = Math.floor(num);
    const words = convertLakhs(intPart);
    return words ? words + ' Only' : 'Zero Only';
  };

  const handleDownloadInvoice = async () => {
    if (!invoice || !request) return;

    try {
      const lineItems: Array<{ no: string; desc: string; hsn: string; qty: number; rate: number; unit: string; total: number; gstRate: number }> = [];
      
      // 1. Towing charges
      if (invoice.towingCharges && Number(invoice.towingCharges) > 0) {
        lineItems.push({
          no: String(lineItems.length + 1).padStart(2, "0"),
          desc: `Emergency Towing Service (${invoice.towingDistanceKm || 0} km)`,
          hsn: "9987 29",
          qty: 1,
          rate: Number(invoice.towingCharges),
          unit: "Nos",
          total: Number(invoice.towingCharges),
          gstRate: Number(invoice.gstRate || 18),
        });
      }

      // 2. Parts consumed
      if (invoice.rsaJobCard?.partsConsumed && Array.isArray(invoice.rsaJobCard.partsConsumed)) {
        invoice.rsaJobCard.partsConsumed.forEach((p: any) => {
          lineItems.push({
            no: String(lineItems.length + 1).padStart(2, "0"),
            desc: p.partName || p.desc || "EV Replacement Part",
            hsn: p.partNumber || "8507 60 00",
            qty: p.quantity || 1,
            rate: Number(p.unitPrice || 0),
            unit: "Nos",
            total: (p.quantity || 1) * Number(p.unitPrice || 0),
            gstRate: Number(invoice.gstRate || 18),
          });
        });
      }

      // 3. Labor charges
      const laborCharges = Number(invoice.rsaJobCard?.laborCharges || invoice.laborTotal || 0);
      if (laborCharges > 0) {
        lineItems.push({
          no: String(lineItems.length + 1).padStart(2, "0"),
          desc: "On-Site Repair Labor / Troubleshooting",
          hsn: "9987 19",
          qty: 1,
          rate: laborCharges,
          unit: "Hrs",
          total: laborCharges,
          gstRate: Number(invoice.gstRate || 18),
        });
      }

      // Fallback fallback if invoice has grand total but no job card lines recorded
      if (lineItems.length === 0 && Number(invoice.grandTotal) > 0) {
        lineItems.push({
          no: "01",
          desc: "Roadside Assistance Service Fees",
          hsn: "9987 29",
          qty: 1,
          rate: Number(invoice.taxableAmount || invoice.grandTotal),
          unit: "Nos",
          total: Number(invoice.taxableAmount || invoice.grandTotal),
          gstRate: Number(invoice.gstRate || 18),
        });
      }

      const itemsHtml = lineItems.map((item) => `
        <tr>
          <td style="padding: 6px; border-right: 1px solid #e2e8f0; text-align: center; color: #64748b;">${item.no}</td>
          <td style="padding: 6px; border-right: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">${item.desc}</td>
          <td style="padding: 6px; border-right: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #475569;">${item.hsn}</td>
          <td style="padding: 6px; border-right: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${item.gstRate}%</td>
          <td style="padding: 6px; border-right: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${item.qty}</td>
          <td style="padding: 6px; border-right: 1px solid #e2e8f0; text-align: right;">₹${item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          <td style="padding: 6px; border-right: 1px solid #e2e8f0; text-align: center;">${item.unit}</td>
          <td style="padding: 6px; text-align: right; font-weight: 800; color: #0f172a;">₹${item.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('');

      const customerName = request.customer
        ? `${request.customer.firstName || ''} ${request.customer.lastName || ''}`.trim()
        : 'Valued Customer';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>RSA Tax Invoice</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #334155;
              font-size: 11px;
            }
            .invoice-box {
              width: 100%;
              border: 1px solid #e2e8f0;
              padding: 20px;
              background: #fff;
              position: relative;
            }
            .title {
              text-align: center;
              font-size: 18px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 20px;
              color: #0f172a;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 10px;
            }
            .grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              border: 1px solid #e2e8f0;
              margin-bottom: 15px;
            }
            .grid-col {
              padding: 10px;
            }
            .grid-col-right {
              border-left: 1px solid #e2e8f0;
              display: grid;
              grid-template-cols: 100px 1fr;
              gap: 5px;
            }
            .metadata-label {
              font-weight: 800;
              color: #94a3b8;
              text-transform: uppercase;
              font-size: 9px;
            }
            .metadata-value {
              font-weight: bold;
              color: #1e293b;
            }
            .bill-to {
              font-weight: 800;
              color: #94a3b8;
              text-transform: uppercase;
              font-size: 9px;
              margin-bottom: 5px;
              display: block;
            }
            .buyer-name {
              font-size: 12px;
              font-weight: 900;
              color: #0f172a;
              margin-bottom: 3px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              border: 1px solid #e2e8f0;
            }
            th {
              background: #f8fafc;
              padding: 8px;
              font-weight: 900;
              font-size: 10px;
              border-bottom: 2px solid #e2e8f0;
              border-right: 1px solid #e2e8f0;
            }
            tr {
              border-bottom: 1px solid #e2e8f0;
            }
            .subtotal-row {
              background: #f8fafc;
              font-weight: bold;
            }
            .tax-box {
              display: grid;
              grid-template-cols: 1fr 1fr;
              margin-top: 15px;
            }
            .tax-breakdown {
              border: 1px solid #e2e8f0;
              padding: 10px;
              background: #f8fafc;
              display: flex;
              flex-direction: column;
              gap: 5px;
            }
            .tax-row {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
            }
            .grand-total {
              font-size: 13px;
              font-weight: 900;
              color: #ef4444;
              border-top: 1px solid #cbd5e1;
              padding-top: 5px;
              margin-top: 5px;
            }
            .words-box {
              border: 2px solid #101828;
              padding: 8px;
              background: #f8fafc;
              margin-top: 15px;
              font-weight: bold;
            }
            .words-value {
              color: #0f172a;
              font-weight: 900;
            }
            .payment-summary-box {
              border: 2px solid #101828;
              padding: 10px;
              margin-top: 15px;
              background-color: #f8fafc;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              font-weight: bold;
            }
            .bank-details-box {
              border: 2px solid #101828;
              padding: 10px;
              margin-top: 15px;
              display: grid;
              grid-template-cols: 1fr 1fr;
              font-size: 10px;
            }
            .declaration-box {
              border: 2px solid #101828;
              margin-top: 15px;
              padding: 8px;
              font-size: 8px;
              color: #64748b;
              line-height: 1.3;
            }
            .watermark {
              position: absolute;
              top: 35%;
              left: 30%;
              transform: rotate(-25deg);
              border: 5px solid ${isPaid ? '#10b981' : '#ef4444'};
              color: ${isPaid ? '#10b981' : '#ef4444'};
              font-size: 40px;
              font-weight: 900;
              text-transform: uppercase;
              padding: 10px 30px;
              border-radius: 10px;
              opacity: 0.25;
              letter-spacing: 4px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="watermark">${isPaid ? 'Paid' : 'Unpaid'}</div>
            <div class="title">Roadside Assist Tax Invoice</div>

            <!-- Vendor / Company Details -->
            <div class="grid">
              <div class="grid-col">
                <div style="font-size: 13px; font-weight: 900; color: #0f172a; margin-bottom: 5px;">FlutterFlirt EV & Mobility</div>
                <div style="font-weight: bold; color: #1e293b;">${request.center?.centerName || 'Bhopal Head Office'}</div>
                <div style="color: #64748b; font-size: 9px; margin-top: 3px; line-height: 1.3;">
                  ${request.center?.address || '123 Arera Colony, Bhopal, MP — 462016'}
                </div>
                <div style="font-weight: 800; color: #0f172a; margin-top: 8px;">GSTIN: ${request.center?.gstin || '23AAACF1234A1Z1'}</div>
              </div>
              <div class="grid-col-right" style="border-left: 1px solid #e2e8f0;">
                <div class="grid-col" style="grid-column: span 2; display: grid; grid-template-cols: 100px 1fr; gap: 5px;">
                  <div class="metadata-label">Invoice No.</div>
                  <div class="metadata-value">${invoice.invoiceNumber}</div>
                  <div class="metadata-label">Dated</div>
                  <div class="metadata-value">${new Date(invoice.invoiceDate || invoice.createdAt || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div class="metadata-label">Request No.</div>
                  <div class="metadata-value">${request.requestNumber}</div>
                  <div class="metadata-label">Vehicle Reg No.</div>
                  <div class="metadata-value">${request.vehicle?.registrationNo || request.vehiclePlate || 'N/A'}</div>
                </div>
              </div>
            </div>

            <!-- Client / Buyer Info -->
            <div class="grid">
              <div class="grid-col">
                <span class="bill-to">Buyer (Bill To)</span>
                <div class="buyer-name">${customerName}</div>
                <div style="color: #64748b; font-size: 9px; line-height: 1.3;">
                  ${request.breakdownAddress || 'Emergency Breakdown Location'}
                </div>
              </div>
              <div class="grid-col" style="border-left: 1px solid #e2e8f0; display: grid; grid-template-cols: 80px 1fr; gap: 5px;">
                <div class="metadata-label">GSTIN/UIN:</div>
                <div class="metadata-value">N/A</div>
                <div class="metadata-label">State:</div>
                <div class="metadata-value">Madhya Pradesh</div>
                <div class="metadata-label">Phone:</div>
                <div class="metadata-value">${request.customer?.phone || 'N/A'}</div>
                <div class="metadata-label">Email:</div>
                <div class="metadata-value">${request.customer?.email || 'N/A'}</div>
              </div>
            </div>

            <!-- Goods / Services Table -->
            <table>
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">Sr. No.</th>
                  <th>Description of Goods / Services</th>
                  <th style="width: 80px; text-align: center;">HSN/SAC</th>
                  <th style="width: 60px; text-align: center;">GST Rate</th>
                  <th style="width: 40px; text-align: center;">Qty</th>
                  <th style="width: 80px; text-align: right;">Rate (₹)</th>
                  <th style="width: 40px; text-align: center;">Unit</th>
                  <th style="width: 90px; text-align: right;">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="subtotal-row">
                  <td colspan="7" style="text-align: right; padding: 6px; font-weight: 800;">Subtotal (Taxable Amount):</td>
                  <td style="text-align: right; padding: 6px; font-weight: 900; color: #0f172a;">₹${Number(invoice.taxableAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>

            <!-- Tax Summary -->
            <div class="tax-box">
              <div></div>
              <div class="tax-breakdown">
                <div class="tax-row">
                  <span>Central Tax (CGST @ ${Number(invoice.gstRate || 18) / 2}%):</span>
                  <span>₹${(Number(invoice.gstAmount || 0) / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="tax-row">
                  <span>State Tax (SGST @ ${Number(invoice.gstRate || 18) / 2}%):</span>
                  <span>₹${(Number(invoice.gstAmount || 0) / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="tax-row grand-total">
                  <span>Invoice Total:</span>
                  <span>₹${Number(invoice.grandTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div class="words-box">
              Amount Chargeable (in words): <span class="words-value">Rupees ${numberToWords(invoice.grandTotal)}</span>
            </div>

            <!-- Payment Summary Box -->
            <div class="payment-summary-box">
              <span style="color: ${isPaid ? '#10b981' : '#ef4444'};">
                Amount Paid: ₹${Number(invoice.paidAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span style="color: ${isPaid ? '#10b981' : '#ef4444'};">
                Balance Due: ₹${Number(invoice.balanceDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <!-- Bank Details & Authorized Signatory -->
            <div class="bank-details-box">
              <div>
                <span style="font-weight: 800; color: #101828; display: block; margin-bottom: 4px;">COMPANY'S BANK DETAILS:</span>
                Bank Name: <strong>HDFC Bank</strong><br/>
                A/c No: <strong>50200298754501</strong><br/>
                Branch & IFSC: <strong>Vashi — HDFC0001234</strong>
              </div>
              <div style="text-align: right; display: flex; flex-direction: column; justify-content: space-between; height: 50px;">
                <span style="font-weight: 800; color: #101828;">For ${request.center?.centerName || 'Bhopal Head Office'}</span>
                <span style="font-size: 8px; font-weight: bold; color: #64748b; font-style: italic;">AUTHORISED SIGNATORY</span>
              </div>
            </div>

            <!-- Standard Declaration -->
            <div class="declaration-box">
              <strong style="color: #475569; display: block; margin-bottom: 2px;">Declaration:</strong>
              We declare that this invoice shows the actual price of the goods or services described and that all particulars are true and correct.
            </div>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Download Bill ${invoice.invoiceNumber}`,
        UTI: 'com.adobe.pdf',
      });
    } catch (e) {
      console.error("Error generating/sharing bill PDF:", e);
      alert("Failed to generate PDF bill.");
    }
  };

  const getFriendlyStatusText = () => {
    switch (status) {
      case 'requested': return 'Roadside Assistance Request logged';
      case 'validated': return 'Request validated by dispatcher';
      case 'assigned': return 'Dispatcher assigned recovery team';
      case 'en_route': return 'Technician dispatched and en-route';
      case 'on_site': return 'Technician on-site repairing vehicle';
      case 'job_card_created': return 'Technician on-site repairing vehicle';
      case 'resolved': return 'Breakdown resolved successfully';
      case 'towed': return 'Vehicle towed to service center';
      case 'closed': return 'RSA request completed and closed';
      default: return status.replace(/_/g, ' ').toUpperCase();
    }
  };

  const stepsData = [
    {
      id: 1,
      title: 'Requested',
      completed: true,
      time: formatTime(request.requestedAt || request.createdAt),
      description: 'Your doorstep pickup/emergency recovery request has been logged in the system.',
      content: (
        <View style={styles.stepDetails}>
          <Text style={styles.detailText}>• Channel: Mobile App SOS</Text>
          <Text style={styles.detailText}>• Issue Type: {request.issueType?.replace(/_/g, ' ').toUpperCase()}</Text>
          {request.issueDescription ? (
            <Text style={styles.detailText}>• Notes: &quot;{request.issueDescription}&quot;</Text>
          ) : null}
        </View>
      ),
    },
    {
      id: 2,
      title: 'Assigned',
      completed: currentStep >= 3,
      time: isAssigned ? formatTime(assignment?.createdAt) : '--:--',
      description: 'Technician and recovery van assigned to your location.',
      content: (
        <View style={styles.stepDetails}>
          {assignment ? (
            <>
              <Text style={styles.detailText}>• Dispatch: {assignment.technician?.firstName} {assignment.technician?.lastName}</Text>
              <Text style={styles.detailText}>• Service Van: {assignment.van?.vanCode} ({assignment.van?.makeModel})</Text>
              <Text style={styles.detailText}>• Est. Dispatch: {assignment.etaMinutes ? `${assignment.etaMinutes} mins` : 'N/A'}</Text>
            </>
          ) : (
            <Text style={styles.detailText}>Awaiting technician scheduling from operations center...</Text>
          )}
        </View>
      ),
    },
    {
      id: 3,
      title: 'Accepted',
      completed: currentStep >= 4,
      time: isAccepted ? formatTime(assignment?.updatedAt) : '--:--',
      description: 'Recovery team accepted dispatch and preparing toolkit.',
      content: (
        <View style={styles.stepDetails}>
          {isAccepted ? (
            <>
              <Text style={styles.detailText}>Technician confirmed dispatch job.</Text>
              {assignment?.technician?.phone ? (
                <TouchableOpacity
                  style={styles.callContactButton}
                  onPress={() => handleCallTechnician(assignment.technician!.phone)}
                >
                  <Feather name="phone" size={12} color="#ef4444" style={{ marginRight: 6 }} />
                  <Text style={styles.callContactText}>Call Technician</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <Text style={styles.detailText}>Waiting for technician job acceptance...</Text>
          )}
        </View>
      ),
    },
    {
      id: 4,
      title: 'Enroute',
      completed: currentStep >= 5,
      time: isEnroute ? formatTime(request.enrouteAt || assignment?.updatedAt) : '--:--',
      description: 'Technician is travelling to your breakdown coordinates.',
      content: (
        <View style={styles.stepDetails}>
          {isEnroute ? (
            <>
              <Text style={styles.detailText}>Technician is driving to your location.</Text>
              <Text style={styles.detailText}>• Breakdown Address: {request.breakdownAddress || 'N/A'}</Text>
            </>
          ) : (
            <Text style={styles.detailText}>Dispatched vehicle enroute indicator...</Text>
          )}
        </View>
      ),
    },
    {
      id: 5,
      title: 'Resolved',
      completed: currentStep >= 6,
      time: isResolved ? formatTime(request.resolvedAt) : '--:--',
      description: 'On-site repairs complete, vehicle recovered successfully.',
      content: (
        <View style={styles.stepDetails}>
          {isResolved ? (
            <Text style={styles.detailText}>On-site troubleshooting resolved the breakdown. Vehicle is ready to drive or towed.</Text>
          ) : (
            <Text style={styles.detailText}>Awaiting service closure report...</Text>
          )}
        </View>
      ),
    },
    {
      id: 6,
      title: 'Billed',
      completed: currentStep >= 7,
      time: isBilled ? formatTime(invoice?.invoiceDate || invoice?.createdAt) : '--:--',
      description: 'Service charges and diagnostic invoice logged.',
      content: (
        <View style={styles.stepDetails}>
          {loadingInvoice ? (
            <ActivityIndicator size="small" color="#ef4444" style={{ alignSelf: 'flex-start' }} />
          ) : invoice ? (
            <>
              <Text style={styles.detailText}>• Invoice No: {invoice.invoiceNumber}</Text>
              <Text style={styles.detailText}>• Grand Total: ₹{parseFloat(String(invoice.grandTotal)).toLocaleString()}</Text>
              <Text style={styles.detailText}>• Payment Status: {invoice.paymentStatus?.toUpperCase() || 'UNPAID'}</Text>
              <TouchableOpacity
                style={styles.downloadInvoiceBtn}
                onPress={handleDownloadInvoice}
                activeOpacity={0.8}
              >
                <Feather name="download" size={14} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.downloadInvoiceBtnText}>Download Bill</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.detailText}>Awaiting invoice processing...</Text>
          )}
        </View>
      ),
    },
    {
      id: 7,
      title: 'Paid',
      completed: currentStep >= 8,
      time: isPaid ? formatTime(invoice?.paidAt || invoice?.updatedAt) : '--:--',
      description: 'Service fee payment recorded and verified.',
      content: (
        <View style={styles.stepDetails}>
          {isPaid ? (
            <>
              <Text style={styles.detailText}>• Payment Received: ₹{parseFloat(String(invoice?.grandTotal)).toLocaleString()}</Text>
              <Text style={styles.detailText}>• Status: Payment Verified</Text>
            </>
          ) : (
            <Text style={styles.detailText}>Awaiting payment registration...</Text>
          )}
        </View>
      ),
    },
    {
      id: 8,
      title: 'Closed',
      completed: isClosed,
      time: isClosed ? formatTime(request.closedAt || request.updatedAt) : '--:--',
      description: 'RSA request successfully completed and archived.',
      content: (
        <View style={styles.stepDetails}>
          {isClosed ? (
            <>
              <Text style={styles.detailText}>This roadside recovery ticket is closed.</Text>
              {invoice ? (
                <TouchableOpacity
                  style={styles.downloadInvoiceBtn}
                  onPress={handleDownloadInvoice}
                  activeOpacity={0.8}
                >
                  <Feather name="download" size={14} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.downloadInvoiceBtnText}>Download Bill</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <Text style={styles.detailText}>Awaiting final sign-off...</Text>
          )}
        </View>
      ),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#18181b" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Roadside Assist Tracker</Text>
          <Text style={styles.headerSubtitle}>
            {request.vehiclePlate || 'N/A'} — {request.issueType?.replace(/_/g, ' ').toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.syncHeaderBtn} 
          onPress={handleSync} 
          disabled={isSyncing}
          activeOpacity={0.7}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Feather name="rotate-cw" size={18} color="#ef4444" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.sirenIconBg}>
              <Feather name="alert-triangle" size={18} color="#7f1d1d" />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryLabel}>Emergency SOS Request</Text>
              <Text style={styles.summaryNumber}>
                {request.requestNumber || `REQ-${request.requestId.slice(0, 8).toUpperCase()}`}
              </Text>
              <Text style={styles.summaryStatusText}>{getFriendlyStatusText()}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${(Math.min(currentStep, 8) / 8) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressPercentageText}>
              Step {currentStep} of 8 • {Math.round((Math.min(currentStep, 8) / 8) * 100)}% Complete
            </Text>
          </View>
        </View>

        {/* Steps Stepper List */}
        <Text style={styles.timelineTitle}>DISPATCH & RECOVERY LIFECYCLE</Text>

        <View style={styles.stepperContainer}>
          {stepsData.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.completed && !isActive;
            const isPending = !step.completed;
            const isExpanded = expandedStep === step.id;

            return (
              <View key={step.id} style={styles.stepContainer}>
                {/* Visual Line & Dot */}
                <View style={styles.stepLeftColumn}>
                  <View
                    style={[
                      styles.stepDot,
                      isCompleted && styles.dotCompleted,
                      isActive && styles.dotActive,
                      isPending && styles.dotPending,
                    ]}
                  >
                    {isCompleted ? (
                      <Feather name="check" size={12} color="#ffffff" />
                    ) : (
                      <Text
                        style={[
                          styles.dotText,
                          isActive && styles.dotTextActive,
                          isPending && styles.dotTextPending,
                        ]}
                      >
                        {step.id}
                      </Text>
                    )}
                  </View>
                  {index < stepsData.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        step.completed && stepsData[index + 1].completed && styles.lineCompleted,
                      ]}
                    />
                  )}
                </View>

                {/* Step Details & Accordion */}
                <View style={styles.stepRightColumn}>
                  <TouchableOpacity
                    style={styles.stepHeaderRow}
                    activeOpacity={0.7}
                    onPress={() => step.completed && setExpandedStep(isExpanded ? null : step.id)}
                    disabled={!step.completed}
                  >
                    <View style={styles.stepTextContent}>
                      <Text
                        style={[
                          styles.stepTitle,
                          isActive && styles.stepTitleActive,
                          isPending && styles.stepTitlePending,
                        ]}
                      >
                        {step.title}
                      </Text>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                    </View>
                    <View style={styles.stepTimeRow}>
                      <Text style={styles.stepTimeText}>{step.time}</Text>
                      {step.completed && (
                        <Feather
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={14}
                          color="#71717a"
                          style={{ marginLeft: 6 }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Accordion Expandable Content */}
                  {isExpanded && step.completed && (
                    <View style={styles.expandedContentBox}>{step.content}</View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Medium',
    marginTop: 2,
  },
  syncHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf9f6',
  },
  loadingText: {
    fontSize: 14,
    color: '#71717a',
    marginTop: 12,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#faf9f6',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  errorBackButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorBackButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sirenIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#991b1b',
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  summaryNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
    marginVertical: 4,
  },
  summaryStatusText: {
    fontSize: 13,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  progressContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
    paddingTop: 16,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f4f4f5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ef4444',
  },
  progressPercentageText: {
    fontSize: 11,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Medium',
    marginTop: 8,
  },
  timelineTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#71717a',
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 16,
  },
  stepperContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  stepContainer: {
    flexDirection: 'row',
    minHeight: 64,
  },
  stepLeftColumn: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
  },
  dotCompleted: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  dotActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ef4444',
  },
  dotPending: {
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
  },
  dotText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  dotTextActive: {
    color: '#ef4444',
  },
  dotTextPending: {
    color: '#a1a1aa',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#f4f4f5',
    marginVertical: 4,
    zIndex: 1,
  },
  lineCompleted: {
    backgroundColor: '#ef4444',
  },
  stepRightColumn: {
    flex: 1,
    paddingBottom: 20,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepTextContent: {
    flex: 1,
    marginRight: 12,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  stepTitleActive: {
    color: '#ef4444',
  },
  stepTitlePending: {
    color: '#a1a1aa',
  },
  stepDescription: {
    fontSize: 12,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 2,
  },
  stepTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepTimeText: {
    fontSize: 11,
    color: '#a1a1aa',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  expandedContentBox: {
    marginTop: 10,
    backgroundColor: '#faf9f6',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  stepDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#27272a',
    fontFamily: 'PlusJakartaSans-Regular',
    lineHeight: 16,
  },
  callContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  callContactText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ef4444',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  downloadInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    alignSelf: 'stretch',
  },
  downloadInvoiceBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
