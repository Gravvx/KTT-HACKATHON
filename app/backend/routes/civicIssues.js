const express = require('express');
const router = express.Router();
const localDb = require('../utils/localDb');

// Helper to determine responsible authority and helpline by category
const getDepartmentInfo = (category, title = '') => {
  const cat = (category || '').toLowerCase();
  const t = (title || '').toLowerCase();

  if (cat.includes('road') || cat.includes('pothole') || t.includes('road') || t.includes('pothole')) {
    return {
      responsibleDepartment: 'Public Works Department (PWD) / Municipal Corporation Road Wing',
      helpline: '1800-11-0093 / City 311 Helpline',
      escalationPortal: 'Central Public Grievance Portal (CPGRAMS) & State PWD Portal',
      resolutionSteps: [
        'Complaint filed in Municipal Grievance Tracking System',
        'Zonal Junior Engineer dispatched for physical site inspection',
        'Work order issued for cold-mix or bitumen road patching',
        'Quality verification and citizen feedback confirmation',
      ],
    };
  }

  if (cat.includes('sanitation') || cat.includes('waste') || cat.includes('garbage') || t.includes('garbage') || t.includes('dump')) {
    return {
      responsibleDepartment: 'Solid Waste Management (SWM) Dept, City Municipal Corporation',
      helpline: '1969 (Swachh Bharat Toll-Free Helpline)',
      escalationPortal: 'Swachhata-MoHUA Mobile App & Municipal Portal',
      resolutionSteps: [
        'Automated ticket assigned to Ward Sanitary Inspector',
        'Garbage compactor vehicle and cleaning crew dispatched within 12 hours',
        'Disinfection and lime powder spraying around container site',
      ],
    };
  }

  if (cat.includes('water') || cat.includes('sewage') || cat.includes('drain') || t.includes('water') || t.includes('drain')) {
    return {
      responsibleDepartment: 'City Water Supply & Sewerage Board (Jal Board / PHED)',
      helpline: '1916 (Central Water & Drainage Helpline)',
      escalationPortal: 'Jal Seva Online Portal / Consumer Grievance Cell',
      resolutionSteps: [
        'Pipeline and valve inspection by line-man team',
        'Super-sucker or jetting machine deployed for blocked drain clearing',
        'Water contamination testing and pressure restoration',
      ],
    };
  }

  if (cat.includes('electric') || cat.includes('light') || t.includes('light') || t.includes('current')) {
    return {
      responsibleDepartment: 'Electricity Distribution Company (DISCOM) & Municipal Streetlight Cell',
      helpline: '1912 (National Power Outage & Fault Helpline)',
      escalationPortal: 'National Power Portal & DISCOM Mobile App',
      resolutionSteps: [
        'Circuit line inspection for feeder trip or cable fault',
        'Replacement of defective LED fixture or transformer fuse',
        'Verification of nighttime illumination by ward supervisor',
      ],
    };
  }

  // Default General Civic Issue
  return {
    responsibleDepartment: 'District Collectorate & Municipal Corporation Public Grievance Wing',
    helpline: '1076 (Chief Minister Citizen Helpline) / 1950',
    escalationPortal: 'CPGRAMS (pgportal.gov.in)',
    resolutionSteps: [
      'Grievance registered under District Public Redressal System',
      'Assigned to nodal officer with 7-day resolution mandate',
      'Action Taken Report (ATR) updated and communicated via SMS',
    ],
  };
};

// GET /api/civic-issues
router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    const issues = localDb.getCivicIssues(category);
    res.json({ success: true, count: issues.length, issues });
  } catch (err) {
    console.error('Error fetching civic issues:', err);
    res.status(500).json({ error: 'Failed to fetch civic issues' });
  }
});

// GET /api/civic-issues/:id
router.get('/:id', (req, res) => {
  try {
    const issue = localDb.getCivicIssueById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Civic issue not found' });
    res.json({ success: true, issue });
  } catch (err) {
    console.error('Error fetching issue:', err);
    res.status(500).json({ error: 'Failed to fetch issue details' });
  }
});

// POST /api/civic-issues/report
router.post('/report', (req, res) => {
  try {
    const { title, category, description, location, city, urgency, reportedBy, phone } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ error: 'Title, description, and location are required' });
    }

    const deptInfo = getDepartmentInfo(category, title);

    const newIssue = localDb.saveCivicIssue({
      title: title.trim(),
      category: category || 'General Civic Grievance',
      description: description.trim(),
      location: location.trim(),
      city: city || 'Not Specified',
      urgency: urgency || 'Medium',
      reportedBy: reportedBy || 'Concerned Citizen',
      phone: phone || 'Anonymous',
      status: 'Reported',
      statusColor: '#00d2ff',
      department: deptInfo.responsibleDepartment,
      officialPortalUrl: deptInfo.escalationPortal || 'https://pgportal.gov.in',
      ...deptInfo,
    });

    res.json({
      success: true,
      message: 'Civic issue registered successfully in local records.',
      issue: newIssue,
    });
  } catch (err) {
    console.error('Report civic issue error:', err);
    res.status(500).json({ error: 'Failed to report civic issue' });
  }
});

// POST /api/civic-issues/:id/upvote
router.post('/:id/upvote', (req, res) => {
  try {
    const upvotes = localDb.upvoteCivicIssue(req.params.id);
    if (upvotes === null) return res.status(404).json({ error: 'Issue not found' });
    res.json({ success: true, upvotes });
  } catch (err) {
    console.error('Upvote error:', err);
    res.status(500).json({ error: 'Failed to upvote issue' });
  }
});

module.exports = router;
