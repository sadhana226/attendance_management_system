# Walkthrough - கற்க Attendance Portal Phase 2 Expansion Complete

We have successfully completed all Phase 2 expansion tasks. The application is now a university-grade administrative portal with full support for student portals, timetable automation, leave request workflows, audit trails, and template customizers.

---

## 1. Timetable Scheduler & Auto-fill Attendance
- **Weekly Schedule (`Timetable.jsx`):** Added a weekly scheduler grid where staff can define subject lectures (day, start time, end time, class name).
- **Auto-fill (`Attendance.jsx`):** When launching the attendance marking screen, the system fetches active timetable records, compares them with the current day and system time, and automatically selects the correct class and subject slot.

---

## 2. OD / Medical Leave Approvals & Calculations
- **Student Leaves Submission (`LeaveRequests.jsx`):** Students can submit leave applications with start/end dates, type (Medical, On-Duty), explanation, and mock medical certificates.
- **Faculty Approval Desk:** Staff can view, approve, or reject pending requests.
- **Non-Penalizing Logic:** Once an OD/ML leave is approved, any student absences during that time are excluded from their total class count, preventing penalties on their overall percentage score.



## 5. Configuration settings & Template Editors
- **Threshold Slider (`Settings.jsx`):** Customize the alert limit (default 75%) dynamically.
- **Parent Alert Template:** Customize the body template sent to parent emails, with support for live parameters like `{name}`, `{rollNumber}`, `{subject}`, and `{date}`.

---

## 6. Student Portal Dashboard & Self-Service
- **Roll Number Access (`Login.jsx`):** Students can log in to the portal securely by selecting the **Student Portal** tab and inputting their Roll Number.
- **Personal Dashboard (`StudentPortal.jsx`):** Displays their customized attendance rate, absence counts, and approved leaves.
- **PDF Report Exporter:** Exposes a **Download PDF Report Card** trigger that renders a printable document layout with their full subject statistics.

---

## How to Test and Verify

### Step 1: Initialize Database Seeding
Open your terminal in `backend/` and run the seeding script to load sample student accounts, timetables, and leave records:
```bash
node data/seedData.js
```

### Step 2: Log in as Faculty
1. Open the portal page in your browser.
2. Under **Faculty Portal**, sign in with:
   - **Email:** `selvakumar@college.edu`
   - **Password:** `password123`
3. Explore the new **Class Timetable**, **Leave Approvals**, and **Settings** sidebar menus.
4. Try modifying the slider in **Settings** or updating a student's profile.

### Step 3: Register a Student
1. Go to the **Student Directory**.
2. Click **Add Student** and register a new student profile:
   - **Name:** Vijay
   - **Roll Number:** `CS2023099`
   - **Email:** `vijay@college.edu`
   - **Class:** `Computer Science - Sem VI`
3. Save the profile. The success alert will notify you that Vijay can now log in using `CS2023099`.

### Step 4: Log in as Student
1. Click **Sign Out** to return to the Login screen.
2. Select the **Student Portal** tab at the top.
3. Input the Roll Number: `CS2023099` (or `CS2023002` for Chloe Chen).
4. Click **Sign In as Student**.
5. You will access their personal student dashboard, review their timetable schedule, and download a print-ready **PDF Report Card**!
