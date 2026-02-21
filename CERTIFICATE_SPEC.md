# Certificate & Document Specifications

> Based on sample provided by client (2026-02-21)
> Reference image saved in project directory

---

## Document 1: Community Service Log — "Work Days and Time"

This is the **daily hour log** PDF. Layout breakdown:

### Header (top-right aligned, logo top-left)
- **Logo**: Circular "The Foundation of Change" logo (top-left)
- **Director**: Jennifer Schroeder, Executive Director
- **Website**: https://www.thefoundationofchange.org
- **Email**: info@thefoundationofchange.org
- **Tax ID**: Organization Tax ID Number: 33-5003265

### Title
**"Community Service Log - Work Days and Time"** (centered, dark blue, large font)

### Info Fields (two-column layout)
| Left Column | Right Column |
|-------------|-------------|
| Client-Worker: [name] | Current Address: [address] |
| Start Date: [date] | Probation Officer: [name] |
| Date Issued: [date] | Court ID: [id] |
| Verification Code: [code] | Local Charity: The Foundation of Change |

### Hours Table
**"Hours Completed:"** (centered heading, dark blue)

4-column repeating pattern of `Date | Hrs:Mins`:

| Date | Hrs:Mins | Date | Hrs:Mins | Date | Hrs:Mins | Date | Hrs:Mins |
|------|----------|------|----------|------|----------|------|----------|
| | | | | | | | |
| | | | | | | | |
(multiple empty rows, auto-filled with tracked data)

### Footer
> "The Foundation of Change is a registered 501(c)(3) nonprofit organization. To confirm authenticity, visit www.thefoundationofchange.org, click the Verify Certificate tab, and enter the verification code from this document. Verification details should match the enrollment information above. For further questions, contact info@thefoundationofchange.org."

### Signature Block
```
Certified by,

[handwritten signature]
J. Schroeder, MS CADC
```

### Design Notes
- **Colors**: Dark navy blue for headings/labels, black for body text
- **Font**: Serif-style for headings, clean sans-serif for body
- **Table**: Light borders, clean grid layout
- **Links**: Blue hyperlinks for website and email
- **Overall feel**: Formal, institutional, court-ready document

---

## Document 2: Certificate of Completion

**Not yet seen** — need sample from client.

Based on site description, it should contain:
- Participant's full name
- Total verified hours + completion timestamp
- Unique verification code
- Provider signature + EIN number

---

## Technical Implementation Notes

### PDF Generation Approach
- Use `@react-pdf/renderer` or `pdf-lib` on the server side
- Generate via Supabase Edge Function or Next.js API route
- Store generated PDFs in Supabase Storage
- Serve via signed URLs (time-limited access)

### Data Required for Generation
```typescript
interface CertificateData {
  // Participant info
  clientName: string;
  currentAddress: string;
  
  // Case info
  probationOfficer: string;
  courtId: string;
  
  // Program info
  startDate: Date;
  dateIssued: Date;
  verificationCode: string;
  localCharity: string; // always "The Foundation of Change"
  
  // Hours data
  hoursLog: Array<{
    date: Date;
    hours: number;
    minutes: number;
  }>;
  
  // Totals
  totalHours: number;
  totalMinutes: number;
}
```

### Verification Code Format
- TBD — need to determine format from client (UUID, short alphanumeric, etc.)
- Must be unique, non-guessable, and lookup-able via the verification portal
