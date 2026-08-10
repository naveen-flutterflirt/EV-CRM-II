import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ServiceDetailData } from '../types';
import api from '../../../../config/axios';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface ServiceDetailScreenProps {
  detail?: ServiceDetailData | null;
  onBack: () => void;
  onBookNextService?: () => void;
}

export const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  detail,
  onBack,
  onBookNextService,
}) => {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const serviceDate = detail?.serviceDate;
  const serviceType = detail?.serviceType;
  const odometerKm = detail?.odometerKm;
  const techName = detail?.technicianName;
  const techRating = detail?.technicianRating;
  const laborItems = detail?.laborItems || [];
  const partsReplaced = detail?.partsReplaced || [];
  const techNotes = detail?.technicianNotes;
  const totalAmount = detail?.totalAmount;

  const hasDetailData = Boolean(
    serviceType ||
    serviceDate ||
    techName ||
    laborItems.length > 0 ||
    partsReplaced.length > 0
  );

  const handleDownloadInvoice = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const jobCardId = detail?.id;
      if (!jobCardId) throw new Error("No Job Card ID");

      // 1. Fetch Job Card details
      const jcRes = await api.get(`/job-cards/${jobCardId}`);
      const jobCard = jcRes.data?.data || jcRes.data;

      // 2. Fetch Invoice details
      const invRes = await api.get(`/invoices?jobCardId=${jobCardId}`);
      const rawInv = invRes.data?.data || invRes.data;
      const invoice = Array.isArray(rawInv) ? rawInv[0] : (rawInv?.data?.[0] || rawInv);
      
      if (!invoice) {
        Alert.alert("Invoice Not Found", "No compiled invoice exists for this service record.");
        setIsDownloading(false);
        return;
      }

      // 3. Fetch Parts and Services
      const partsRes = await api.get(`/job-parts?jobCardId=${jobCardId}`);
      const rawParts = partsRes.data?.data || partsRes.data;
      const partsList = Array.isArray(rawParts) ? rawParts : (rawParts?.data || []);

      const servicesRes = await api.get(`/job-services?jobCardId=${jobCardId}`);
      const rawServices = servicesRes.data?.data || servicesRes.data;
      const servicesList = Array.isArray(rawServices) ? rawServices : (rawServices?.data || []);

      // 4. Map parts and services
      const normalizedParts = partsList.map((p: any) => {
        const isWarranty = Boolean(p.isWarranty);
        const price = isWarranty ? 0 : parseFloat(p.unitPrice || '0');
        return {
          ...p,
          partName: p.part?.partName || (p.battery?.serialNo ? 'Battery' : '') || p.description || 'Spare Part',
          unitPrice: price,
          isWarranty,
        };
      });

      const normalizedServices = servicesList.map((s: any) => {
        const isFree = Boolean(s.isFree);
        const charge = isFree ? 0 : parseFloat(s.lineTotal || s.unitCharge || '0');
        return {
          ...s,
          serviceName: s.catalogService?.serviceName || s.description || 'Labour Charge',
          labourCharge: charge,
          isFree,
        };
      });

      // 5. Build lineItems
      const lineItems: Array<{ no: string; desc: string; hsn: string; qty: number; rate: number; unit: string; total: number; gstRate: number }> = [];
      
      normalizedParts.forEach((p: any) => {
        lineItems.push({
          no: String(lineItems.length + 1).padStart(2, "0"),
          desc: p.partName,
          hsn: p.partCode || "8507 60 00",
          qty: p.qty,
          rate: p.isWarranty ? 0 : p.unitPrice,
          unit: "Nos",
          total: p.isWarranty ? 0 : p.qty * p.unitPrice,
          gstRate: p.gstRate || 18,
        });
      });

      normalizedServices.forEach((s: any) => {
        lineItems.push({
          no: String(lineItems.length + 1).padStart(2, "0"),
          desc: s.serviceName,
          hsn: "9987 19 99",
          qty: s.qty || 1,
          rate: s.isFree ? 0 : (s.unitCharge || s.labourCharge),
          unit: "Hrs",
          total: s.isFree ? 0 : (s.qty || 1) * (s.unitCharge || s.labourCharge),
          gstRate: s.gstRate || 18,
        });
      });

      const itemsHtml = lineItems.map((item) => `
        <tr>
          <td style="padding: 6px; border-right: 1px solid #cbd5e1; text-align: center; color: #64748b;">${item.no}</td>
          <td style="padding: 6px; border-right: 1px solid #cbd5e1; font-weight: bold; color: #1e293b;">${item.desc}</td>
          <td style="padding: 6px; border-right: 1px solid #cbd5e1; text-align: center; font-family: monospace; color: #475569;">${item.hsn}</td>
          <td style="padding: 6px; border-right: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #475569;">${item.gstRate}%</td>
          <td style="padding: 6px; border-right: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${item.qty}</td>
          <td style="padding: 6px; border-right: 1px solid #cbd5e1; text-align: right;">₹${item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          <td style="padding: 6px; border-right: 1px solid #cbd5e1; text-align: center;">${item.unit}</td>
          <td style="padding: 6px; text-align: right; font-weight: 800; color: #0f172a;">₹${item.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('');

      // Group taxes by HSN/SAC code matching ERP logic
      const hsnMap: { [code: string]: { val: number; rate: number; tax: number } } = {};
      
      normalizedParts.forEach((p: any) => {
        if (p.isWarranty) return;
        const code = p.partCode || "8507 60 00";
        const val = p.qty * p.unitPrice;
        const rate = (p.gstRate || 18) / 2;
        const tax = val * ((p.gstRate || 18) / 100) / 2;
        if (!hsnMap[code]) {
          hsnMap[code] = { val: 0, rate, tax: 0 };
        }
        hsnMap[code].val += val;
        hsnMap[code].tax += tax;
      });

      normalizedServices.forEach((s: any) => {
        if (s.isFree) return;
        const code = "9987 19 99";
        const val = (s.qty || 1) * (s.unitCharge || s.labourCharge);
        const rate = (s.gstRate || 18) / 2;
        const tax = val * ((s.gstRate || 18) / 100) / 2;
        if (!hsnMap[code]) {
          hsnMap[code] = { val: 0, rate, tax: 0 };
        }
        hsnMap[code].val += val;
        hsnMap[code].tax += tax;
      });

      const hsnItems = Object.entries(hsnMap).map(([code, data]) => ({
        code,
        val: data.val,
        rate: data.rate,
        tax: data.tax
      }));

      const hsnRowsHtml = hsnItems.map((hsn) => `
        <tr>
          <td style="padding: 4px; border-right: 1px solid #cbd5e1; font-family: monospace;">${hsn.code}</td>
          <td style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: right;">₹${hsn.val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          <td style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: center;">${hsn.rate}%</td>
          <td style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: right;">₹${hsn.tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          <td style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: center;">${hsn.rate}%</td>
          <td style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: right;">₹${hsn.tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          <td style="padding: 4px; text-align: right; font-weight: 800; color: #0f172a;">₹${(hsn.tax * 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('');

      const numberToWords = (num: number): string => {
        const a = [
          '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
          'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const convertTens = (n: number): string => {
          if (n < 20) return a[n];
          return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
        };

        const convertHundreds = (n: number): string => {
          if (n > 99) {
            return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertTens(n % 100) : '');
          }
          return convertTens(n);
        };

        const convertThousands = (n: number): string => {
          if (n > 999) {
            return convertHundreds(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convertHundreds(n % 1000) : '');
          }
          return convertHundreds(n);
        };

        const convertLakhs = (n: number): string => {
          if (n > 99999) {
            return convertHundreds(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convertThousands(n % 100000) : '');
          }
          return convertThousands(n);
        };

        const intPart = Math.floor(num);
        const words = convertLakhs(intPart);
        return words ? words + ' Only' : 'Zero Only';
      };

      const formatDate = (dateStr: any) => {
        if (!dateStr) return '--:--';
        try {
          return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        } catch (e) {
          return String(dateStr);
        }
      };

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Tax Invoice</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #334155;
              font-size: 10px;
            }
            .invoice-box {
              width: 100%;
              border: 1px solid #cbd5e1;
              padding: 20px;
              background: #fff;
              position: relative;
              box-sizing: border-box;
            }
            .title {
              text-align: center;
              font-size: 16px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 20px;
              color: #0f172a;
              border-bottom: 2px solid #cbd5e1;
              padding-bottom: 10px;
            }
            .grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              border: 1px solid #cbd5e1;
              margin-bottom: 15px;
            }
            .grid-col {
              padding: 10px;
              box-sizing: border-box;
            }
            .grid-col-right {
              border-left: 1px solid #cbd5e1;
              display: grid;
              grid-template-cols: 100px 1fr;
              gap: 5px;
            }
            .metadata-label {
              font-weight: 800;
              color: #64748b;
              text-transform: uppercase;
              font-size: 8px;
            }
            .metadata-value {
              font-weight: bold;
              color: #1e293b;
            }
            .bill-to {
              font-weight: 800;
              color: #64748b;
              text-transform: uppercase;
              font-size: 8px;
              margin-bottom: 5px;
              display: block;
            }
            .buyer-name {
              font-size: 11px;
              font-weight: 900;
              color: #0f172a;
              margin-bottom: 3px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              border: 1px solid #cbd5e1;
            }
            th {
              background: #f8fafc;
              padding: 6px;
              font-weight: 900;
              font-size: 9px;
              border-bottom: 2px solid #cbd5e1;
              border-right: 1px solid #cbd5e1;
            }
            tr {
              border-bottom: 1px solid #cbd5e1;
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
              border: 1px solid #cbd5e1;
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
              font-size: 12px;
              font-weight: 900;
              color: #4d6a00;
              border-top: 1px solid #cbd5e1;
              padding-top: 5px;
              margin-top: 5px;
            }
            .words-box {
              border: 1px solid #cbd5e1;
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
              border: 1px solid #cbd5e1;
              padding: 10px;
              margin-top: 15px;
              background-color: #f8fafc;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              font-weight: bold;
            }
            .bank-details-box {
              border: 1px solid #cbd5e1;
              padding: 10px;
              margin-top: 15px;
              display: grid;
              grid-template-cols: 1fr 1fr;
              font-size: 9px;
            }
            .declaration-box {
              border: 1px solid #cbd5e1;
              margin-top: 15px;
              padding: 8px;
              font-size: 7.5px;
              color: #64748b;
              line-height: 1.3;
            }
            .watermark {
              position: absolute;
              top: 38%;
              left: 28%;
              transform: rotate(-22deg);
              border: 6px solid ${invoice.status.toLowerCase() === 'paid' ? '#10b981' : '#ef4444'};
              color: ${invoice.status.toLowerCase() === 'paid' ? '#10b981' : '#ef4444'};
              font-size: 44px;
              font-weight: 900;
              text-transform: uppercase;
              padding: 12px 36px;
              border-radius: 16px;
              opacity: 0.15;
              letter-spacing: 4px;
              background-color: transparent;
              z-index: 99;
              pointer-events: none;
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            ${invoice.status.toLowerCase() === 'paid' ? '<div class="watermark">Paid</div>' : ''}
            <div class="title">Tax Invoice</div>

            <!-- Vendor / Company Details -->
            <div class="grid">
              <div class="grid-col">
                <div style="font-size: 12px; font-weight: 900; color: #0f172a; margin-bottom: 5px;">FlutterFlirt EV & Mobility</div>
                <div style="font-weight: bold; color: #1e293b;">${jobCard.center?.centerName || 'Service Center'}</div>
                <div style="color: #64748b; font-size: 8px; margin-top: 3px; line-height: 1.3;">
                  ${jobCard.center?.address || 'Primary EV Workshop Center'}
                </div>
                <div style="font-weight: 800; color: #0f172a; margin-top: 8px;">GSTIN: ${jobCard.center?.gstin || '27AABCF1234M1Z5'}</div>
              </div>
              <div class="grid-col-right" style="border-left: 1px solid #cbd5e1;">
                <div class="grid-col" style="grid-column: span 2; display: grid; grid-template-cols: 100px 1fr; gap: 5px;">
                  <div class="metadata-label">Invoice No.</div>
                  <div class="metadata-value">${invoice.invoiceNumber}</div>
                  <div class="metadata-label">Dated</div>
                  <div class="metadata-value">${formatDate(invoice.invoiceDate)}</div>
                  <div class="metadata-label">Job Card No.</div>
                  <div class="metadata-value">JOB-${(jobCardId || '').slice(0, 8)}</div>
                  <div class="metadata-label">Vehicle Reg No.</div>
                  <div class="metadata-value">${jobCard.vehicle?.registrationNo || 'N/A'}</div>
                </div>
              </div>
            </div>

            <!-- Client / Buyer Info -->
            <div class="grid">
              <div class="grid-col">
                <span class="bill-to">Buyer (Bill To)</span>
                <div class="buyer-name">${jobCard.customer?.firstName} ${jobCard.customer?.lastName}</div>
                <div style="color: #64748b; font-size: 8px; line-height: 1.3;">
                  ${jobCard.customerPlace || 'Customer Garage'}
                </div>
              </div>
              <div class="grid-col" style="border-left: 1px solid #cbd5e1; display: grid; grid-template-cols: 80px 1fr; gap: 5px;">
                <div class="metadata-label">GSTIN/UIN:</div>
                <div class="metadata-value">N/A</div>
                <div class="metadata-label">State:</div>
                <div class="metadata-value">Maharashtra</div>
                <div class="metadata-label">Phone:</div>
                <div class="metadata-value">${jobCard.customer?.phone || 'N/A'}</div>
                <div class="metadata-value">${jobCard.customer?.email || 'N/A'}</div>
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
                <tr class="subtotal-row" style="border-top: 2px solid #cbd5e1;">
                  <td colspan="7" style="text-align: right; padding: 6px; font-weight: 800;">Subtotal (Taxable Amount):</td>
                  <td style="text-align: right; padding: 6px; font-weight: 900; color: #0f172a;">₹${invoice.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>

            <!-- Tax Summary -->
            <div class="tax-box">
              <div></div>
              <div class="tax-breakdown">
                <div class="tax-row">
                  <span>Central Tax (CGST @ 9%):</span>
                  <span>₹${invoice.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="tax-row">
                  <span>State Tax (SGST @ 9%):</span>
                  <span>₹${invoice.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="tax-row grand-total">
                  <span>Invoice Total:</span>
                  <span>₹${invoice.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div class="words-box">
              Amount Chargeable (in words): <span class="words-value">Rupees ${numberToWords(invoice.grandTotal)}</span>
            </div>

            <!-- HSN/SAC Tax Breakup Details Table -->
            <div style="margin-top: 15px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #fff; box-sizing: border-box;">
              <span style="font-weight: 800; color: #64748b; font-size: 8px; text-transform: uppercase; margin-bottom: 5px; display: block;">
                HSN/SAC Tax Breakup Details:
              </span>
              <table style="width: 100%; border-collapse: collapse; font-size: 8px; margin-top: 5px; border: 1px solid #cbd5e1;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                    <th style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: left; font-size: 7.5px;">HSN/SAC</th>
                    <th style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: right; font-size: 7.5px;">Taxable Value</th>
                    <th style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: center; font-size: 7.5px;">Central Rate</th>
                    <th style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: right; font-size: 7.5px;">Central Tax Amt.</th>
                    <th style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: center; font-size: 7.5px;">State Rate</th>
                    <th style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: right; font-size: 7.5px;">State Tax Amt.</th>
                    <th style="padding: 4px; text-align: right; font-size: 7.5px;">Total Tax Amt.</th>
                  </tr>
                </thead>
                <tbody style="font-weight: bold;">
                  ${hsnRowsHtml}
                  <tr style="border-top: 1px solid #cbd5e1; font-weight: 900; background: #f8fafc;">
                    <td style="padding: 4px; border-right: 1px solid #cbd5e1;">Total</td>
                    <td style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: right;">₹${invoice.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: center;">—</td>
                    <td style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: right;">₹${invoice.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: center;">—</td>
                    <td style="padding: 4px; border-right: 1px solid #cbd5e1; text-align: right;">₹${invoice.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td style="padding: 4px; text-align: right; color: #0f172a;">₹${(invoice.cgstAmount + invoice.sgstAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Payment Summary Box -->
            <div class="payment-summary-box">
              <span style="color: #10b981;">
                Amount Paid: ₹${invoice.amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span style="color: ${invoice.status.toLowerCase() === 'paid' ? '#10b981' : '#ef4444'};">
                Balance Due: ₹${invoice.balanceDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <!-- Bank Details & Authorized Signatory -->
            <div class="bank-details-box">
              <div>
                <span style="font-weight: 800; color: #101828; display: block; margin-bottom: 4px;">COMPANY'S BANK DETAILS:</span>
                Bank Name: <strong>HDFC Bank</strong><br/>
                A/c No: <strong>50100246734561</strong><br/>
                Branch & IFSC: <strong>Vashi — HDFC0001234</strong>
              </div>
              <div style="text-align: right; display: flex; flex-direction: column; justify-content: space-between; height: 50px;">
                <span style="font-weight: 800; color: #101828;">For ${jobCard.center?.centerName || 'Service Center'}</span>
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
        dialogTitle: `Download Invoice ${invoice.invoiceNumber}`,
        UTI: 'com.adobe.pdf',
      });
    } catch (e) {
      console.error("Error generating/sharing invoice PDF:", e);
      Alert.alert("Error", "Failed to generate PDF invoice.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!detail || !hasDetailData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Feather name="arrow-left" size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Detail</Text>
        </View>

        <View style={styles.emptyDetailContainer}>
          <View style={styles.emptyIconBadge}>
            <Feather name="calendar" size={32} color="#84cc16" />
          </View>
          <Text style={styles.emptyTitle}>No Service Details Found</Text>
          <Text style={styles.emptySubtitle}>
            {"You don't have any recent service activity or record details right now. Keep your EV running smooth by scheduling a routine checkup."}
          </Text>

          {onBookNextService && (
            <TouchableOpacity
              style={styles.emptyBookBtn}
              onPress={onBookNextService}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyBookBtnText}>Book a Service</Text>
              <Feather name="chevron-right" size={16} color="#1a2b0c" />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Detail</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Service Type Lime Banner */}
        <View style={styles.limeBanner}>
          <Text style={styles.bannerLabel}>SERVICE TYPE</Text>
          <Text style={styles.bannerValue}>{serviceType || 'Vehicle Service'}</Text>
          <Feather name="settings" size={48} color="rgba(26, 43, 12, 0.08)" style={styles.bannerBgIcon} />
        </View>

        {/* Metrics Row: Service Date & Odometer */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>SERVICE DATE</Text>
            <Text style={styles.metricVal}>{serviceDate || 'N/A'}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>ODOMETER</Text>
            <Text style={styles.metricVal}>{odometerKm ? `${odometerKm} ` : '0 '}<Text style={styles.kmUnit}>km</Text></Text>
          </View>
        </View>

        {/* Lead Technician Card (Only rendered if technician name exists) */}
        {techName ? (
          <View style={styles.techCard}>
            <View style={styles.techLeft}>
              <View style={styles.techAvatarCircle}>
                <Feather name="user" size={20} color="#4d7c0f" />
              </View>
              <View style={styles.techMeta}>
                <Text style={styles.techLabel}>Lead Technician</Text>
                <Text style={styles.techName}>{techName}</Text>
              </View>
            </View>
            {techRating ? (
              <View style={styles.ratingBadge}>
                <Feather name="star" size={12} color="#84cc16" style={{ marginRight: 4 }} />
                <Text style={styles.ratingText}>{techRating.toFixed(1)}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Labor & Inspection Section (Only rendered if items exist) */}
        {laborItems.length > 0 ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>LABOR & INSPECTION</Text>
            {laborItems.map((item) => (
              <View key={item.id} style={styles.lineItemRow}>
                <View style={styles.lineItemMeta}>
                  <Text style={styles.lineItemTitle}>{item.title}</Text>
                  {item.subtitle ? <Text style={styles.lineItemSub}>{item.subtitle}</Text> : null}
                </View>
                <Text style={styles.lineItemPrice}>₹{item.price.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Parts Replaced Section (Only rendered if parts exist) */}
        {partsReplaced.length > 0 ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>PARTS REPLACED</Text>
            <View style={styles.partsCardGroup}>
              {partsReplaced.map((part) => (
                <View key={part.id} style={styles.partCardRow}>
                  <View style={styles.partIconCircle}>
                    <Feather name="box" size={16} color="#64748b" />
                  </View>
                  <View style={styles.partMeta}>
                    <Text style={styles.partName} numberOfLines={1}>{part.partName}</Text>
                    {part.partNumber ? <Text style={styles.partNum}>{part.partNumber}</Text> : null}
                  </View>
                  <Text style={styles.partPrice}>₹{part.price.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Technician Notes Section (Only rendered if notes exist) */}
        {techNotes ? (
          <View style={styles.techNotesCard}>
            <View style={styles.notesHeader}>
              <Feather name="info" size={16} color="#64748b" style={{ marginRight: 6 }} />
              <Text style={styles.notesTitle}>TECHNICIAN NOTES</Text>
            </View>
            <Text style={styles.notesBody}>{techNotes}</Text>
          </View>
        ) : null}

        {/* Total Amount Row (Only rendered if amount > 0) */}
        {totalAmount && totalAmount > 0 ? (
          <>
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
                <Text style={styles.taxSub}>Includes GST & environmental levies</Text>
              </View>
              <Text style={styles.totalVal}>₹{totalAmount.toFixed(2)}</Text>
            </View>

            {/* Download Tax Invoice Action Button */}
            <TouchableOpacity
              style={styles.downloadInvoiceBtn}
              onPress={handleDownloadInvoice}
              activeOpacity={0.85}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather name="download" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.downloadText}>Download Tax Invoice</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : null}

        {/* Book Next Service Touch */}
        <TouchableOpacity
          style={styles.bookNextTouch}
          onPress={onBookNextService}
          activeOpacity={0.8}
        >
          <Feather name="calendar" size={16} color="#0f172a" style={{ marginRight: 6 }} />
          <Text style={styles.bookNextText}>Book Next Service</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  limeBanner: {
    backgroundColor: '#a2e52c',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#365314',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  bannerValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  bannerBgIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f5f3f9',
    borderRadius: 20,
    padding: 16,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  kmUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#64748b',
  },
  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f3f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  techLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef6d6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  techMeta: {},
  techLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  techName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 12,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  lineItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  lineItemMeta: {
    flex: 1,
    marginRight: 12,
  },
  lineItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  lineItemSub: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  lineItemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  partsCardGroup: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  partCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partMeta: {
    flex: 1,
    marginRight: 8,
  },
  partName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  partNum: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  partPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  techNotesCard: {
    backgroundColor: '#f5f3f9',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  notesBody: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  taxSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  totalVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4d7c0f',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  downloadInvoiceBtn: {
    backgroundColor: '#365314',
    borderRadius: 24,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  downloadText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  bookNextTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 30,
  },
  bookNextText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  emptyDetailContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  emptyIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#f7fee7',
    borderWidth: 1,
    borderColor: '#d9f99d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  emptyBookBtn: {
    backgroundColor: '#a2e52c',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyBookBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
