// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBAIUQO7n6aaeNY4DRzVZnQKf3QTA7ZAOw",
  authDomain: "bin-2-win.firebaseapp.com",
  projectId: "bin-2-win",
  storageBucket: "bin-2-win.firebasestorage.app",
  messagingSenderId: "429952260355",
  appId: "1:429952260355:web:dccc98b10bcc545c613136",
  measurementId: "G-RLGBTDHJTW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Authentication service
const auth = firebase.auth();

// Get a reference to the Firestore service (if you plan to use Firestore)
const db = firebase.firestore();

// Listen for authentication state changes
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    // User is signed out (or account was deleted)
    console.log("User is signed out or account deleted. Cleaning up local storage.");
    
    // Get current user data before clearing localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    // Clear currentUser from localStorage
    localStorage.removeItem("currentUser");

    // Remove user from "users" in localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (currentUser) {
        users = users.filter(u => u.name !== currentUser.name);
        localStorage.setItem("users", JSON.stringify(users));
    }


    // Remove user from "rankingData" in localStorage
    let rankingData = JSON.parse(localStorage.getItem("rankingData")) || [];
     if (currentUser) {
         rankingData = rankingData.filter(u => u.name !== currentUser.name);
         localStorage.setItem("rankingData", JSON.stringify(rankingData));
     }

  } else {
    // User is signed in
    console.log("User is signed in:", user);
  }
});
// 🌟 Utility & Globals
function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt || '';
  }
  function setSrc(id, src) {
    const el = document.getElementById(id);
    if (el) el.src = src || '';
  }
  function showIfExists(id, show = true) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? 'block' : 'none';
  }
  function hideForms() {
    ['registerForm', 'loginForm'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }
  function showForm(formId) {
    hideForms();
    const el = document.getElementById(formId);
    if (el) el.style.display = 'block';
  }
  function showTab(tabId) {
    ['home', 'ranking', 'settings', 'account', 'adminPanel'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = (id === tabId) ? 'block' : 'none';
    });
  }

  let currentUser = JSON.parse(localStorage.getItem("currentUser"))?.name || null;
  let uploadedPhoto = JSON.parse(localStorage.getItem("currentUser"))?.photo || "";
  let usedCodes = JSON.parse(localStorage.getItem("usedCodes")) || [];
  let rankingData = JSON.parse(localStorage.getItem("rankingData")) || [];

  // 📷 Profile Upload
  document.addEventListener('DOMContentLoaded', () => {
    const picInput = document.getElementById('profilePicInput');
    if (picInput) {
      picInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
          return alert("Please upload a valid image (JPEG or PNG).");
        }
        const reader = new FileReader();
        reader.onload = () => {
          uploadedPhoto = reader.result;
          setSrc('profilePicPreview', uploadedPhoto);

          let player = rankingData.find(p => p.name === currentUser);
          if (player) player.photo = uploadedPhoto;
          else rankingData.push({ name: currentUser, score: 0, photo: uploadedPhoto });

          localStorage.setItem("rankingData", JSON.stringify(rankingData));
          renderLeaderboard();
        };
        reader.readAsDataURL(file);
      });
    }

    // 🌙 Dark Mode
    const toggle = document.getElementById('darkToggle');
    if (toggle) {
      toggle.checked = localStorage.getItem('darkMode') === 'true';
      document.body.classList.toggle('dark-mode', toggle.checked);
      toggle.addEventListener('change', () => {
        const enabled = toggle.checked;
        document.body.classList.toggle('dark-mode', enabled);
        localStorage.setItem('darkMode', enabled);
      });
    }

    hideForms();

    // Initialize Dashboard (if you're on dashboard.html)
    if (document.body.classList.contains('dashboard')) {
      const user = JSON.parse(localStorage.getItem("currentUser"));
      if (!user) return window.location.href = "index.html";
      currentUser = user.name;
      uploadedPhoto = user.photo || "";

      // Profile section
      setText('welcomeMessage', `Welcome, ${user.name.split(" ")[0]}!`);
      setSrc('profilePicPreview', user.photo || '');
      setText('accUsername', user.name);
      setText('accEmail', user.email);
      setText('accGrade', user.grade);
      setText('accSection', user.section);
      showIfExists('logoutSection', true);

      // Ensure user is in leaderboard
      if (user.name !== "Admin" && !rankingData.some(p => p.name === user.name)) {
        rankingData.push({ name: user.name, score: 0, photo: user.photo || "" });
        localStorage.setItem("rankingData", JSON.stringify(rankingData));
      }

      // Sync codes from Google
      const scriptURL = "https://script.google.com/macros/s/AKfycbyk3-q78a7i8a6725IFjY067DKZ8cP4NQYrzmjwDAelh9gNmVOKUnQlmf5Hw2siHAfl0w/exec";
      fetch(scriptURL)
        .then(res => res.json())
        .then(data => {
          usedCodes = data.map(row => row[0].toLowerCase());
          localStorage.setItem("usedCodes", JSON.stringify(usedCodes));
        })
        .catch(console.error);

      setInterval(() => {
        fetch(scriptURL)
          .then(res => res.json())
          .then(data => {
            usedCodes = data.map(row => row[0].toLowerCase());
            localStorage.setItem("usedCodes", JSON.stringify(usedCodes));
          })
          .catch(console.error);
      }, 10000);

      renderLeaderboard();

      if (user.name === "Admin") {
        showIfExists("adminPanel", true);
        showIfExists("adminTab", true);
        showTab('adminPanel');
      } else {
        showIfExists("adminPanel", false);
        showIfExists("adminTab", false);
        showTab('home');
      }

      const submitBtn = document.getElementById("submitBtn");
      if (submitBtn) submitBtn.addEventListener("click", submitCode);
    }
  });

// 🔐 Login
async function submitLogin() { // Added async here
  const email = getVal('loginEmail'); // Get value from the email input field
  const password = getVal('loginPassword');

  // ** Firebase Authentication Login **
  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password); // Use the email variable here
    console.log("🟢 Firebase Login successful:", userCredential.user);

    // Continue with existing logic (using localStorage for now)
    const users = JSON.parse(localStorage.getItem("users")) || [];
    // Find user in localStorage by email
    const found = users.find(u => u.email === email);

    if (!found) {
      console.warn("User not found in localStorage after successful Firebase login.");
      alert("Login successful! User data not found in local storage.");
      window.location.href = "dashboard.html";
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(found));
    alert("Login successful!");
    window.location.href = "dashboard.html";

  } catch (error) {
    console.error("❌ Firebase Login Error:", error);
    alert("❌ Firebase Login Error: " + error.message);
  }
}

// 📝 Registration
async function submitRegister() { // Added async here
  const user = {
    name: getVal('regUsername'),
    email: getVal('regEmail'),
    password: getVal('regPassword'), // We will use this for Firebase Auth
    age: getVal('regAge'),
    grade: getVal('regGrade'),
    section: getVal('regSection'),
    photo: uploadedPhoto
  };

  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.some(u => u.name === user.name)) {
    return alert("Username already taken. Please choose a different one.");
  }
  if (user.name === "Admin") {
    return alert("This username is reserved for administrators.");
  }


  // ** Firebase Authentication Registration **
  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);
    console.log("🟢 Firebase Registration successful:", userCredential.user);

    // Continue with existing logic (dual write)
    // Save to local storage
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(user));

    rankingData.push({ name: user.name, score: 0, photo: user.photo || "" });
    localStorage.setItem("rankingData", JSON.stringify(rankingData));

    // 🔗 Send registration to Google Sheets
    const scriptURL = "https://script.google.com/macros/s/AKfycbyk3-q78a7i8a6725IFjY067DKZ8cP4NQYrzmjwDAelh9gNmVOKUnQlmf5Hw2siHAfl0w/exec"; // Replace with your actual Web App URL
    fetch(scriptURL, {
      method: "POST",
      body: new URLSearchParams({
        action: "register",
        name: user.name,
        email: user.email,
        age: user.age,
        grade: user.grade,
        section: user.section
      })
    })
    .then(res => res.text())
    .then(response => console.log("🟢 Google Sheet says:", response))
    .catch(err => console.error("❌ Failed to log to Google Sheet:\n", err));

    alert(`Welcome, ${user.name}! Registration successful.`);
    setTimeout(() => window.location.href = "dashboard.html", 1500);

  } catch (error) {
    console.error("❌ Firebase Registration Error:", error);
    alert("❌ Firebase Registration Error: " + error.message);
  }
}


//change password (We will address this later with Firebase Auth)
function changePassword() {
  const currentPassword = getVal('currentPassword');
  const newPassword = getVal('newPassword');
  const confirmPassword = getVal('confirmPassword');

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser || !currentPassword || !newPassword || !confirmPassword) {
    return alert("⚠️ Please fill in all fields.");
  }

  if (newPassword !== confirmPassword) {
    return alert("❌ New passwords do not match.");
  }

  const user = users.find(u => u.name === currentUser.name);
  if (!user || user.password !== currentPassword) { // This password check will be removed later
    return alert("❌ Incorrect current password.");
  }

  // ✅ Update local storage
  user.password = newPassword;
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(user));

  // ✅ Send update to Google Sheets (We will address this later with Firebase Auth)
  const scriptURL = "https://script.google.com/macros/s/AKfycbyk3-q78a7i8a6725IFjY067DKZ8cP4NQYrzmjwDAelh9gNmVOKUnQlmf5Hw2siHAfl0w/exec";
  fetch(scriptURL, {
      method: "POST",
      body: new URLSearchParams({
        action: "changePassword",
        name: user.name,
        newPassword: newPassword
      })
    })
    .then(res => res.text())
    .then(result => console.log("📄 Sheet update:", result))
    .catch(err => console.error("❌ Error updating sheet:", err));

  alert("✅ Password changed successfully.");
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
}


// 🚪 Logout
function logoutUser() {
    alert("You’ve been logged out.");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  }

  //verifying user account
  async function verifyUserInSheet() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    if (currentUser.name === "Admin") return; // Do not delete Admin

    try {
      // Send request to fetch user registrations from Google Sheet
      const response = await fetch('https://script.google.com/macros/s/AKfycbyk3-q78a7i8a6725IFjY067DKZ8cP4NQYrzmjwDAelh9gNmVOKUnQlmf5Hw2siHAfl0w/exec', {
        method: 'POST',
        body: new URLSearchParams({
          action: 'checkUserExists',
          name: currentUser.name
        })
      });

      const result = await response.text();

      if (result === "❌ Not found") {
        // User not in Google Sheet – delete local account
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const updatedUsers = users.filter(user => user.name !== currentUser.name);
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        localStorage.removeItem("currentUser");

        alert("⚠️ Your account is not recognized. It has been removed.");
        window.location.href = "index.html";
      }

    } catch (error) {
      console.error("Error verifying user:", error);
    }
  }

  async function validateUserAgainstSheet() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    if (currentUser.name === "Admin") return; // Protect admin

    const formData = new URLSearchParams();
    formData.append("action", "checkUserExists");
    formData.append("name", currentUser.name);

    const response = await fetch('https://script.google.com/macros/s/AKfycbyk3-q78a7i8a6725IFjY067DKZ8cP4NQYrzmjwDAelh9gNmVOKUnQlmf5Hw2siHAfl0w/exec', {
      method: "POST",
      body: formData
    });

    const result = await response.text();

    if (result.includes("❌ Not found")) {
      // Remove user from "users"
      let users = JSON.parse(localStorage.getItem("users")) || [];
      users = users.filter(u => u.name !== currentUser.name);
      localStorage.setItem("users", JSON.stringify(users));

      // Remove user from "rankingData"
      let rankingData = JSON.parse(localStorage.getItem("rankingData")) || [];
      rankingData = rankingData.filter(u => u.name !== currentUser.name);
      localStorage.setItem("rankingData", JSON.stringify(rankingData));

      // Clear current user session
      localStorage.removeItem("currentUser");

      alert("⚠️ Your account was removed due to missing registration record.");
      window.location.href = "index.html";
    }
  }



  // 🧪 Admin: Generate & Copy Codes
  function generatePointCode(prefix = '1p') {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${rand}`;
  }

  function generateSingleCode() {
    const prefix = getVal('codePrefix') || '1p';
    const newCode = generatePointCode(prefix);
    setText('generatedCodeDisplay', newCode);

    usedCodes.push(newCode);
    localStorage.setItem("usedCodes", JSON.stringify(usedCodes));

    fetch("https://script.google.com/macros/s/AKfycbyk3-q78a7i8a6725IFjY067DKZ8cP4NQYrzmjwDAelh9gNmVOKUnQlmf5Hw2siHAfl0w/exec", {
      method: "POST",
      body: new URLSearchParams({
        action: "addCode",
        code: newCode,
        prefix,
        createdBy: "Admin"
      })
    })
    .then(res => res.text())
    .then(txt => console.log("🟢 Server says:", txt))
    .catch(err => console.error("❌ Network error:", err));
  }

  function copyCode() {
    const code = getVal('generatedCodeDisplay');
    if (!code) return alert("No code to copy.");
    navigator.clipboard.writeText(code)
      .then(() => alert("✅ Code copied!"))
      .catch(() => alert("❌ Copy failed.\
"));
  }

  function downloadCodesAsTxt() {
    if (!usedCodes.length) return alert("No codes to export yet.");
    const blob = new Blob(["List of Used Codes\n=================\n" + usedCodes.join('\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Bin2Win_Codes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 🎯 Submit Code
  function submitCode() {
    const codeRaw = getVal('pointCode').toLowerCase();
    const pointsMap = { '1p': 1 };
    const score = pointsMap[codeRaw.slice(0, 2)];

    if (!score) return alert("❌ Use code starting with 1p");
    if (!currentUser) return alert("Please login first.");

    fetch("https://script.google.com/macros/s/AKfycbyk3-q78a7i8a6725IFjY067DKZ8cP4NQYrzmjwDAelh9gNmVOKUnQlmf5Hw2siHAfl0w/exec")
      .then(res => res.json())
      .then(sheetData => {
        const liveCodes = sheetData.map(r => r[0].toLowerCase());
        if (!liveCodes.includes(codeRaw)) {
          return alert("🚫 Unrecognized code. Only Admin-generated codes allowed.");
        }
        if (localStorage.getItem(`codeUsedBy_${codeRaw}`)) {
          return alert("🚫 Already used!");
        }

        let player = rankingData.find(p => p.name === currentUser);
        if (player) player.score += score;
        else rankingData.push({ name: currentUser, score, photo: uploadedPhoto });

        localStorage.setItem(`codeUsedBy_${codeRaw}`, currentUser);
        localStorage.setItem("rankingData", JSON.stringify(rankingData));

        const userEmail = (JSON.parse(localStorage.getItem("users")) || [])
                          .find(u => u.name === currentUser)?.email || "unknown";

        fetch("https://script.google.com/macros/s/AKfycbyk3-q728a7i8a6725IFjY067DKZ8cP4NQYrzmjwDAelh9gNmVOKUnQlmf5Hw2siHAfl0w/exec", {
          method: "POST",
          body: new URLSearchParams({ action: "submit", code: codeRaw, user: currentUser, email: userEmail })
        });

        alert(`${currentUser} earned ${score} point${score > 1 ? 's' : ''}!`);
        document.getElementById('pointCode').value = '';
        renderLeaderboard();
      });
  }

  // 🏆 Leaderboard
  function renderLeaderboard() {
    const topList = document.getElementById('topRanking');
    const fullList = document.getElementById('leaderboard');
    if (!topList || !fullList) return;

    rankingData = JSON.parse(localStorage.getItem("rankingData")) || [];
    const sorted = [...rankingData].sort((a, b) => b.score - a.score);
    const filtered = sorted.filter(e => e.name !== "Admin");

    topList.innerHTML = filtered.length
      ? filtered.slice(0, 3).map((e, i) => {
          const medal = i === 0 ? '🥇' : i === 1 ;
          const avatar = e.photo
            ? `<img src=\"${e.photo}\" style=\"width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #ccc;margin-right:8px;\" />`
            : `<div style=\"width:36px;height:36px;border-radius:50%;background:#ccc;border:2px solid #ccc;margin-right:8px;\"></div>`;
          return `<li style=\"display:flex;align-items:center;gap:8px;\">${avatar}${medal} <strong>${e.name}</strong> - ${e.score}</li>`;
        }).join('')
      : '<li>No players ranked yet.</li>';

    fullList.innerHTML = filtered.length
      ? filtered.map((e, i) => {
          const medal = i < 3 ? (i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉') : '';
          const avatar = e.photo
            ? `<img src=\"${e.photo}\" style=\"width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #ccc;margin-right:8px;\" />`
            : `<div style=\"width:36px;height:36px;border-radius:50%;background:#ccc;border:2px solid #ccc;margin-right:8px;\"></div>`;
          return `<li style=\"display:flex;align-items:center;gap:8px;\">${avatar}${medal} <strong>${e.name}</strong> - ${e.score}</li>`;
        }).join('')
      : '<li>No leaderboard entries available.</li>';
  }

  //CLEAN LEADERBOARD
  function cleanLeaderboard() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const rankingData = JSON.parse(localStorage.getItem("rankingData")) || [];

    const userNames = users.map(u => u.name);

    const cleanedRanking = rankingData.filter(u =>
      u.name === "Admin" || userNames.includes(u.name)
    );

    localStorage.setItem("rankingData", JSON.stringify(cleanedRanking));
  }

  async function cleanRankingDataFromSheet() {
    const rankingData = JSON.parse(localStorage.getItem("rankingData")) || [];

    const response = await fetch("https://script.google.com/macros/s/AKfycbyk3-q78a7i8a6725IFjY067DKZ8cP4NQYrzmjwDAelh9gNmVOKUnQlmf5Hw2siHAfl0w/exec", {
      method: "POST",
      body: new URLSearchParams({ action: "getAllUsernames" })
    });

    const sheetUsernames = await response.json();

    const cleaned = rankingData.filter(entry =>
      entry.name === "Admin" || sheetUsernames.includes(entry.name)
    );

    localStorage.setItem("rankingData", JSON.stringify(cleaned));
  }

