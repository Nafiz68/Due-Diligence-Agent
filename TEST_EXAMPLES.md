# Test Examples - Due Diligence Agent

## Prerequisites
Make sure you have:
1. ✅ Backend running on `http://localhost:5000`
2. ✅ Frontend running on `http://localhost:5174`
3. ✅ MongoDB connected
4. ✅ At least one document uploaded in Documents page
5. ✅ At least one questionnaire uploaded in Questionnaires page

---

## 1. CHAT FEATURE TESTING

### Location: `/chat` (Click "Chat" in sidebar)

### Test Case 1.1: Start a New Chat Session
**Steps:**
1. Navigate to `/chat`
2. Click "New Chat" button
3. Observe: New chat session is created
4. Observe: A sessionId is displayed (e.g., "Session: abc12345")

**Expected Result:** ✅ Chat box is ready to receive messages

---

### Test Case 1.2: Send a Question to Document Chat
**Example Questions (if you have company documents):**

**Question 1 (General):**
```
What are the company's main products or services?
```

**Question 2 (Financial):**
```
What was the total revenue for the last fiscal year?
```

**Question 3 (Operations):**
```
How many employees does the company have?
```

**Question 4 (Risk/Compliance):**
```
What are the key risks mentioned in the company documents?
```

**Steps:**
1. Type a question in the chat input box
2. Click Send button (or press Enter)
3. Wait for AI response (might take 5-10 seconds)

**Expected Result:** ✅
- User message appears on the right (blue background)
- AI response appears on the left (white background)
- Response includes:
  - Main answer text
  - Source citations with document names
  - Relevance scores for each citation
  - Confidence percentage
  - Processing time

---

### Test Case 1.3: View Citations
**Steps:**
1. After receiving a response, look at the "Sources:" section
2. Each citation shows:
   - Document name
   - Excerpt from the document
   - Relevance score (0-100%)

**Expected Result:** ✅ Citations are clickable and show document source information

---

### Test Case 1.4: Context Selection
**Steps:**
1. Select a questionnaire from the "Context" dropdown on the left
2. Ask a question related to that questionnaire
3. The chat will remember the selected questionnaire context

**Example:**
- Select a "Financial Questionnaire"
- Ask: "What answers are provided for revenue questions?"

**Expected Result:** ✅ Chat considers the questionnaire context when answering

---

### Test Case 1.5: Manage Chat Sessions
**Steps:**
1. Create multiple chat sessions by clicking "New Chat" multiple times
2. Sessions appear in the left sidebar
3. Click on a session to view its history
4. Hover over a session to see archive/delete buttons

**Expected Result:** ✅
- Sessions are listed with timestamps
- Can switch between sessions
- Can archive (yellow button) or delete (red button) sessions

---

## 2. REVIEW & MANUAL OVERRIDES FEATURE TESTING

### Location: `/review` (Click "Review" in sidebar)

### Test Case 2.1: View Answer Status
**Steps:**
1. Navigate to `/review`
2. Select a questionnaire from the left panel
3. View the answers for that questionnaire

**Expected Result:** ✅
- Each answer shows a status badge (e.g., "generated", "confirmed", etc.)
- Status colors:
  - Green = "Confirmed"
  - Red = "Rejected"
  - Blue = "Manual Update"
  - Yellow = "Missing Data"
  - Gray = "Pending"

---

### Test Case 2.2: Confirm an Answer
**Steps:**
1. Find an answer with status "generated"
2. Click the **"Confirm"** button (green checkmark)
3. Observe the status changes to "confirmed"

**Expected Result:** ✅
- Status badge changes to green "Confirmed"
- Answer is marked as reviewed
- Audit trail entry is created

---

### Test Case 2.3: Reject an Answer
**Steps:**
1. Find an answer with status "generated"
2. Click the **"Reject"** button (red X)
3. Observe the status changes to "rejected"

**Expected Result:** ✅
- Status badge changes to red "Rejected"
- Review notes can be added
- Audit trail records the rejection

---

### Test Case 2.4: Edit an Answer (Manual Update)
**Steps:**
1. Click the **"Edit"** button on any answer
2. A text area appears with the current answer
3. Modify the text (e.g., add more details)
4. Add review notes explaining the change
5. Click **"Save Changes"** button

**Example Edit:**
```
Original: "The company has 500 employees"
Updated: "The company has 500 employees as of Q4 2024, 
         with plans to expand to 750 by end of 2025"
```

**Expected Result:** ✅
- Status changes to blue "Manual Update"
- `isEdited` flag is set to true
- Manual answer is stored separately
- Audit trail shows: action=manual_updated, actor=current-user, change details

---

### Test Case 2.5: Mark as Missing Data
**Steps:**
1. Find an answer
2. Click **"Missing Data"** button (yellow alert)
3. Optionally add review notes like: "Document does not contain information about X"

**Expected Result:** ✅
- Status changes to yellow "Missing Data"
- Review notes are saved
- Audit trail records missing data status

---

### Test Case 2.6: View Audit Trail
**Steps:**
1. Click on an answer that has been edited/reviewed multiple times
2. Click "View Audit Trail (X)" link
3. Expand the audit trail

**Expected Result:** ✅ Audit trail shows:
```
[Timestamp] | [Action] | [Actor]
2024-02-04 10:30:45 | generated | system
2024-02-04 10:32:12 | manual_edited | current-user
2024-02-04 10:35:00 | confirmed | current-user

For manual edits, shows:
Previous: "Old text..."
New: "New text..."
```

---

### Test Case 2.7: Compare AI vs Manual Answer
**Steps:**
1. Edit an answer to create a manual override
2. After saving, observe both sections:
   - **"AI Generated Answer"** - Original AI response
   - **"Manual Override"** - Your edited version

**Expected Result:** ✅
- Both answers are displayed side-by-side
- Timestamps show when manual update was made
- Clear indication of who made the change (reviewedBy)

---

## 3. CONFIDENCE SCORING & CITATIONS

### Test Case 3.1: Understand Confidence Scores
**Location:** Both Chat and Review pages

**Color Coding:**
- 🟢 **Green (80-100%)**: High confidence - citations strongly support the answer
- 🟡 **Yellow (60-80%)**: Medium confidence - some relevant citations found
- 🔴 **Red (0-60%)**: Low confidence - limited or weak citations

**Steps:**
1. Look at the confidence badge on answers
2. Higher scores mean better document relevance
3. Lower scores might warrant manual review

---

### Test Case 3.2: Citation Relevance
**Steps:**
1. View citations in any answer
2. Note the relevance percentage (e.g., "78% match")
3. Higher percentages = stronger relevance to the question

**Example:**
```
Question: "What is the company's revenue?"
Citation 1: "Annual Report 2024 - Revenue of $5.2B" (89% match)
Citation 2: "Press Release - Financial Highlights" (76% match)
```

---

## 4. END-TO-END WORKFLOW TEST

### Complete Workflow: Upload → Generate → Chat → Review → Approve

**Step 1: Upload Documents** (if not done)
1. Go to `/documents`
2. Upload a PDF (try company annual report)
3. Wait for processing to complete

**Step 2: Upload Questionnaire** (if not done)
1. Go to `/questionnaires`
2. Upload a CSV/Excel with questions
3. Wait for parsing

**Step 3: Generate Answers**
1. Go to `/questionnaires`
2. Click "Generate Answers" for your questionnaire
3. Wait for processing

**Step 4: Chat About Documents**
1. Go to `/chat`
2. Ask related questions to understand document content
3. Review citations to find key information

**Step 5: Review & Approve**
1. Go to `/review`
2. For each answer:
   - Read the AI-generated answer
   - Review citations
   - Check confidence score
3. **Actions:**
   - ✅ Click "Confirm" for good answers
   - ❌ Click "Reject" if incorrect
   - ✏️ Click "Edit" to improve/correct
   - ⚠️ Click "Missing Data" if info not in documents

**Step 6: Export Results**
1. Back in Review page
2. Select your questionnaire
3. Click Export (CSV/Excel/PDF)
4. Download and verify results

---

## 5. ERROR HANDLING TESTS

### Test Case 5.1: Chat with No Documents
**Steps:**
1. Delete all documents
2. Try to chat

**Expected Result:** ✅
```
Error: "No documents found in database. 
Please upload company documents from the Documents page."
```

---

### Test Case 5.2: Invalid Status Transition
**Steps:**
1. Try to send an invalid action in review API

**Expected Result:** ✅ Error message:
```
"Invalid action. Must be: confirmed, rejected, manual_updated, or missing_data"
```

---

### Test Case 5.3: Network Error During Chat
**Steps:**
1. Stop the backend server
2. Try to send a message in chat

**Expected Result:** ✅
```
Error message appears in red at the bottom:
"Failed to process message"
or specific error from server
```

---

## 6. PERFORMANCE & LOAD TESTS

### Test Case 6.1: Multiple Edits to Same Answer
**Steps:**
1. Edit an answer 3-4 times
2. Each time, modify the text and add different notes
3. View the audit trail

**Expected Result:** ✅
- All edits are recorded with timestamps
- Audit trail shows all changes
- No data loss or corruption

---

### Test Case 6.2: Batch Review
**Steps:**
1. Review 10+ answers in sequence
2. Mix of: confirm, reject, edit, missing_data actions

**Expected Result:** ✅
- All changes are saved
- Page remains responsive
- Pagination works if needed

---

## 7. DATA VALIDATION TESTS

### Test Case 7.1: Empty Review Notes
**Steps:**
1. Reject an answer WITHOUT adding review notes

**Expected Result:** ✅
- Rejection still works
- Review notes field is optional

---

### Test Case 7.2: Very Long Manual Answer
**Steps:**
1. Edit an answer and paste a very long text (1000+ characters)
2. Save the changes

**Expected Result:** ✅
- Long text is saved completely
- No truncation
- Displays correctly on review page

---

## 8. QUICK TEST CHECKLIST

Use this checklist to verify all features work:

### Chat Feature
- [ ] Create new chat session
- [ ] Send a question
- [ ] Receive response with citations
- [ ] View citations with relevance scores
- [ ] Select questionnaire context
- [ ] Switch between sessions
- [ ] Delete a chat session
- [ ] Archive a chat session

### Review Feature
- [ ] View all answers for questionnaire
- [ ] See status badges with correct colors
- [ ] Confirm an answer
- [ ] Reject an answer
- [ ] Edit an answer
- [ ] View audit trail
- [ ] Add review notes
- [ ] See confidence scores
- [ ] View citations
- [ ] Mark as missing data

### Integration
- [ ] Chat helps find information for review
- [ ] Review reflects correct statuses
- [ ] Export includes all reviewed answers
- [ ] No errors in browser console
- [ ] Responsive design on different screen sizes

---

## 9. SAMPLE TEST DATA

If you need to create test documents, here are examples:

### Sample Company Annual Report Text
```
ABC Corporation Annual Report 2024

Executive Summary
ABC Corporation is a leading provider of software solutions.
Founded in 2010, we serve over 10,000 customers globally.

Financial Highlights
- Total Revenue: $750 Million (2024)
- Revenue Growth: 24% YoY
- Operating Margin: 28%
- Employee Count: 2,150
- Office Locations: 15 countries

Products & Services
1. Cloud Platform - $450M revenue
2. Enterprise Software - $200M revenue
3. Professional Services - $100M revenue

Risk Factors
- Market competition from larger vendors
- Dependence on cloud infrastructure providers
- Regulatory compliance in different jurisdictions
```

### Sample Questionnaire CSV
```
Category,Subcategory,Question
Financial,Revenue,What was the total revenue in 2024?
Financial,Growth,What is the YoY revenue growth rate?
Operations,Employees,How many employees does the company have?
Operations,Locations,How many office locations does the company operate?
Products,Overview,What are the company's main product lines?
Risk,Market,What market risks are identified?
Risk,Regulatory,What regulatory risks are mentioned?
```

---

## TROUBLESHOOTING

### Chat returns no results
- Ensure documents are uploaded and indexed
- Check that ChromaDB is running
- Try uploading a document with relevant content

### Review page shows no answers
- Verify answers were generated in questionnaires page
- Check that the questionnaire has answers
- Try generating answers if none exist

### Audit trail not showing
- Ensure the answer has been reviewed/edited
- First-time generated answers might not have full audit trail
- Make an edit to see the audit trail appear

### Citations not showing
- Ensure documents are uploaded
- Check that answer has relevant citations
- Low confidence scores might have fewer citations

---

## SUPPORT

For any issues:
1. Check browser console (F12 > Console)
2. Check backend logs (terminal where backend is running)
3. Verify API is responding: `http://localhost:5000/api/health`
4. Try refreshing the page (Ctrl+R)
5. Clear browser cache (Ctrl+Shift+Delete)

Enjoy testing! 🚀
