// app/backend/utils/localDb.js
// Safe, file-based local JSON data storage (No MongoDB required)
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (fileName) => path.join(DATA_DIR, fileName);

// Helper to safely read JSON
const readJson = (fileName, defaultValue = []) => {
  const filePath = getFilePath(fileName);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${fileName}:`, err.message);
    return defaultValue;
  }
};

// Helper to safely write JSON
const writeJson = (fileName, data) => {
  const filePath = getFilePath(fileName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${fileName}:`, err.message);
    return false;
  }
};

const localDb = {
  // Civic Issues (Civic problem resolving & tracking)
  getCivicIssues: (category = null) => {
    const issues = readJson('civic_issues.json', []);
    if (category && category !== 'ALL') {
      return issues.filter((i) => i.category === category);
    }
    return issues;
  },

  getCivicIssueById: (id) => {
    const issues = readJson('civic_issues.json', []);
    return issues.find((i) => i.id === id) || null;
  },

  saveCivicIssue: (issueData) => {
    const issues = readJson('civic_issues.json', []);
    const newIssue = {
      id: `CIVIC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Reported',
      statusColor: '#00d2ff',
      upvotes: 1,
      reportedAt: new Date().toISOString(),
      ...issueData,
    };
    issues.unshift(newIssue);
    writeJson('civic_issues.json', issues);
    return newIssue;
  },

  upvoteCivicIssue: (id) => {
    const issues = readJson('civic_issues.json', []);
    const issue = issues.find((i) => i.id === id);
    if (issue) {
      issue.upvotes = (issue.upvotes || 0) + 1;
      writeJson('civic_issues.json', issues);
      return issue.upvotes;
    }
    return null;
  },

  // Services
  getServices: () => {
    return readJson('services.json', {});
  },

  getServiceById: (id) => {
    const services = readJson('services.json', {});
    return services[id] || null;
  },

  // Users / Auth
  getUsers: () => {
    return readJson('users.json', []);
  },

  findUserByPhone: (phone) => {
    const users = readJson('users.json', []);
    return users.find((u) => u.phone === phone) || null;
  },

  saveUser: ({ name, phone, preferredLanguage = 'en' }) => {
    const users = readJson('users.json', []);
    let user = users.find((u) => u.phone === phone);
    if (user) {
      user.name = name;
      user.preferredLanguage = preferredLanguage;
      user.lastLogin = new Date().toISOString();
    } else {
      user = {
        id: `usr_${Date.now()}`,
        name,
        phone,
        preferredLanguage,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      users.push(user);
    }
    writeJson('users.json', users);
    return user;
  },

  // Applications
  getApplications: (phone = null) => {
    const apps = readJson('applications.json', []);
    if (phone) {
      return apps.filter((a) => a.phone === phone);
    }
    return apps;
  },

  saveApplication: (appData) => {
    const apps = readJson('applications.json', []);
    const newApp = {
      id: `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Submitted',
      statusColor: '#00d2ff',
      submittedAt: new Date().toISOString(),
      ...appData,
    };
    apps.unshift(newApp);
    writeJson('applications.json', apps);
    return newApp;
  },

  // Chat History
  getChatHistory: (limit = 50) => {
    const chats = readJson('chat_history.json', []);
    return chats.slice(-limit);
  },

  saveChatMessage: (chatRecord) => {
    const chats = readJson('chat_history.json', []);
    const entry = {
      id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...chatRecord,
    };
    chats.push(entry);
    const trimmed = chats.slice(-200);
    writeJson('chat_history.json', trimmed);
    return entry;
  },
};

module.exports = localDb;
