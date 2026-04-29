// ===============================
// Employee Attendance App
// JavaScript Logic
// ===============================


// ===============================
// Custom Alert Box
// ===============================

function showAppAlert(message, title = "Notification") {
    const overlay = document.getElementById("appAlertOverlay");
    const alertTitle = document.getElementById("appAlertTitle");
    const alertMessage = document.getElementById("appAlertMessage");

    alertTitle.textContent = title;
    alertMessage.textContent = message;

    overlay.classList.add("active");
}

function closeAppAlert() {
    const overlay = document.getElementById("appAlertOverlay");
    overlay.classList.remove("active");
}


// ===============================
// Global Edit Variables
// ===============================

let editingUserUsername = null;
let editingReportId = null;


// ===============================
// 1. Initial Database Setup
// ===============================

function initDatabase() {
    if (!localStorage.getItem("users")) {
        const users = [
            {
                username: "adhammohamed",
                password: "adhammohamed",
                role: "employee",
                name: "Adham Mohamed",
                code: "emp-101",
                position: "DBA",
                department: "IT",
                manager: "omarsultan",
                branch: "HQ"
            },
            {
                username: "omarsultan",
                password: "omarsultan",
                role: "manager",
                name: "Omar Sultan",
                code: "mgr-201",
                position: "IT Manager",
                department: "IT",
                manager: "admin",
                branch: "HQ"
            },
            {
                username: "admin",
                password: "admin",
                role: "admin",
                name: "Admin",
                code: "adm-901",
                position: "Administrator",
                department: "Management",
                manager: "-",
                branch: "HQ"
            }
        ];

        localStorage.setItem("users", JSON.stringify(users));
    }

    if (!localStorage.getItem("attendance")) {
        localStorage.setItem("attendance", JSON.stringify([]));
    }
}


// ===============================
// 2. Helper Functions
// ===============================

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getAttendance() {
    return JSON.parse(localStorage.getItem("attendance")) || [];
}

function saveAttendance(attendance) {
    localStorage.setItem("attendance", JSON.stringify(attendance));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

function saveCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem("currentUser");
}

function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
}

function getCurrentTime() {
    const now = new Date();

    return now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function calculateHours(startMs, endMs) {
    const diffMs = endMs - startMs;
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours.toFixed(2);
}


// ===============================
// 3. Show / Hide Sections
// ===============================

function showSection(sectionId) {
    const sections = document.querySelectorAll(".section");

    sections.forEach(function (section) {
        section.classList.remove("active");
    });

    document.getElementById(sectionId).classList.add("active");
}


// ===============================
// 4. Login Function
// ===============================

function login() {
    const usernameInput = document.getElementById("username").value.trim().toLowerCase();
    const passwordInput = document.getElementById("password").value.trim();
    const loginMessage = document.getElementById("loginMessage");

    const users = getUsers();

    const user = users.find(function (u) {
        return u.username.toLowerCase() === usernameInput && u.password === passwordInput;
    });

    if (!user) {
        loginMessage.textContent = "Wrong username or password";
        return;
    }

    loginMessage.textContent = "";

    saveCurrentUser(user);

    openDashboard(user);
}


// ===============================
// 5. Open Dashboard Based on Role
// ===============================

function openDashboard(user) {
    if (user.role === "employee") {
        showSection("employeeSection");
        fillEmployeeData(user);
        loadEmployeeReport();
    }

    else if (user.role === "manager") {
        showSection("managerSection");
        fillManagerData(user);
        loadManagerReport();
    }

    else if (user.role === "admin") {
        showSection("adminSection");
        loadAllEmployees();
        loadAdminReport();
    }
}


// ===============================
// 6. Fill Employee Data
// ===============================

function fillEmployeeData(user) {
    document.getElementById("empName").textContent = user.name;
    document.getElementById("empCode").textContent = user.code;
    document.getElementById("empPosition").textContent = user.position;
    document.getElementById("empDept").textContent = user.department;
    document.getElementById("empManager").textContent = user.manager;
    document.getElementById("empBranch").textContent = user.branch;
}


// ===============================
// 7. Fill Manager Data
// ===============================

function fillManagerData(user) {
    document.getElementById("mgrName").textContent = user.name;
    document.getElementById("mgrCode").textContent = user.code;
    document.getElementById("mgrPosition").textContent = user.position;
    document.getElementById("mgrDept").textContent = user.department;
    document.getElementById("mgrBranch").textContent = user.branch;
}


// ===============================
// 8. Logout Function
// ===============================

function logout() {
    clearCurrentUser();

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginMessage").textContent = "";

    showSection("loginSection");
}


// ===============================
// 9. Check In Function
// ===============================

function checkIn() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        alert("Please login first");
        return;
    }

    const attendance = getAttendance();
    const today = getTodayDate();

    const existingRecord = attendance.find(function (record) {
        return record.username === currentUser.username && record.date === today;
    });

    if (existingRecord) {
        alert("You already checked in today");
        return;
    }

    const now = new Date();

    const newRecord = {
        id: Date.now(),
        username: currentUser.username,
        employeeName: currentUser.name,
        manager: currentUser.manager,
        date: today,
        checkIn: getCurrentTime(),
        checkOut: "-",
        checkInMs: now.getTime(),
        checkOutMs: null,
        hours: "-",
        status: "Pending"
    };

    attendance.push(newRecord);
    saveAttendance(attendance);

    alert("Check In saved successfully");

    loadEmployeeReport();
}


// ===============================
// 10. Check Out Function
// ===============================

function checkOut() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        alert("Please login first");
        return;
    }

    const attendance = getAttendance();
    const today = getTodayDate();

    const record = attendance.find(function (item) {
        return item.username === currentUser.username &&
               item.date === today &&
               item.checkOut === "-";
    });

    if (!record) {
        alert("No active Check In found for today");
        return;
    }

    const now = new Date();

    record.checkOut = getCurrentTime();
    record.checkOutMs = now.getTime();
    record.hours = calculateHours(record.checkInMs, record.checkOutMs);
    record.status = "Pending";

    saveAttendance(attendance);

    alert("Check Out saved successfully");

    loadEmployeeReport();
}


// ===============================
// 11. Load Employee Report
// ===============================

function loadEmployeeReport() {
    const currentUser = getCurrentUser();
    const tableBody = document.getElementById("employeeReportTable");

    if (!currentUser || !tableBody) {
        return;
    }

    const attendance = getAttendance();

    const myRecords = attendance.filter(function (record) {
        return record.username === currentUser.username;
    });

    tableBody.innerHTML = "";

    myRecords.forEach(function (record) {
        tableBody.innerHTML += `
            <tr>
                <td>${record.date}</td>
                <td>${record.checkIn}</td>
                <td>${record.checkOut}</td>
                <td>${record.hours}</td>
                <td>${record.status}</td>
            </tr>
        `;
    });
}


// ===============================
// 12. Load Manager Report
// ===============================

function loadManagerReport() {
    const currentUser = getCurrentUser();
    const tableBody = document.getElementById("managerReportTable");

    if (!currentUser || !tableBody) {
        return;
    }

    const attendance = getAttendance();

    const teamRecords = attendance.filter(function (record) {
        return record.manager.toLowerCase() === currentUser.username.toLowerCase();
    });

    tableBody.innerHTML = "";

    teamRecords.forEach(function (record) {
        let actionButton = "";

        if (record.status === "Pending") {
            actionButton = `<button class="main-btn small-btn" onclick="verifyRecord(${record.id})">Verify</button>`;
        } else {
            actionButton = "Verified";
        }

        tableBody.innerHTML += `
            <tr>
                <td>${record.employeeName}</td>
                <td>${record.date}</td>
                <td>${record.checkIn}</td>
                <td>${record.checkOut}</td>
                <td>${record.hours}</td>
                <td>${record.status}</td>
                <td>${actionButton}</td>
            </tr>
        `;
    });
}


// ===============================
// 13. Verify Attendance Record
// ===============================

function verifyRecord(recordId) {
    const attendance = getAttendance();

    const record = attendance.find(function (item) {
        return item.id === recordId;
    });

    if (!record) {
        alert("Record not found");
        return;
    }

    record.status = "Verified";

    saveAttendance(attendance);

    alert("Attendance record verified");

    loadManagerReport();
    loadAdminReport();
}


// ===============================
// 14. Load All Employees For Admin
// ===============================

function loadAllEmployees() {
    const tableBody = document.getElementById("allEmployeesTable");

    if (!tableBody) {
        return;
    }

    const users = getUsers();

    tableBody.innerHTML = "";

    users.forEach(function (user) {
        tableBody.innerHTML += `
            <tr>
                <td>${user.name}</td>
                <td>${user.username}</td>
                <td>${user.code}</td>
                <td>${user.position}</td>
                <td>${user.department}</td>
                <td>${user.manager}</td>
                <td>${user.branch}</td>
                <td>${user.role}</td>
                <td>
                    <div class="action-buttons">
                        <button class="main-btn small-btn" onclick="startEditUser('${user.username}')">Edit</button>
                        <button class="main-btn small-btn" onclick="startChangePassword('${user.username}')">Password</button>
                        <button class="logout-btn small-btn" onclick="deleteEmployee('${user.username}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
}


// ===============================
// 15. Add Or Save Employee
// ===============================

function addOrSaveEmployee() {
    if (editingUserUsername) {
        saveUserChanges();
    } else {
        addEmployee();
    }
}


// ===============================
// 16. Add New Employee
// ===============================

function addEmployee() {
    const name = document.getElementById("newEmpName").value.trim();
    const username = document.getElementById("newEmpUsername").value.trim().toLowerCase();
    const code = document.getElementById("newEmpCode").value.trim();
    const password = document.getElementById("newEmpPassword").value.trim();
    const position = document.getElementById("newEmpPosition").value.trim();
    const department = document.getElementById("newEmpDept").value.trim();
    const manager = document.getElementById("newEmpManager").value.trim().toLowerCase();
    const branch = document.getElementById("newEmpBranch").value.trim();
    const role = document.getElementById("newEmpRole").value;

    if (!name || !username || !code || !password || !position || !department || !branch || !role) {
        alert("Please fill all fields");
        return;
    }

    const users = getUsers();

    const usernameExists = users.some(function (user) {
        return user.username.toLowerCase() === username;
    });

    if (usernameExists) {
        alert("Username already exists");
        return;
    }

    const codeExists = users.some(function (user) {
        return user.code.toLowerCase() === code.toLowerCase();
    });

    if (codeExists) {
        alert("Employee code already exists");
        return;
    }

    const newUser = {
        username: username,
        password: password,
        role: role,
        name: name,
        code: code,
        position: position,
        department: department,
        manager: manager || "-",
        branch: branch
    };

    users.push(newUser);
    saveUsers(users);

    alert("Employee added successfully");

    clearEmployeeForm();
    loadAllEmployees();
}


// ===============================
// 17. Start Edit User
// ===============================

function startEditUser(username) {
    const users = getUsers();

    const user = users.find(function (item) {
        return item.username === username;
    });

    if (!user) {
        alert("User not found");
        return;
    }

    editingUserUsername = username;

    document.getElementById("employeeFormTitle").textContent = "Edit Employee";
    document.getElementById("addEmployeeBtn").textContent = "Save Changes";
    document.getElementById("cancelUserEditBtn").classList.remove("hidden");

    document.getElementById("newEmpName").value = user.name;
    document.getElementById("newEmpUsername").value = user.username;
    document.getElementById("newEmpCode").value = user.code;
    document.getElementById("newEmpPassword").value = "";
    document.getElementById("newEmpPassword").placeholder = "Leave empty to keep old password";
    document.getElementById("newEmpPosition").value = user.position;
    document.getElementById("newEmpDept").value = user.department;
    document.getElementById("newEmpManager").value = user.manager;
    document.getElementById("newEmpBranch").value = user.branch;
    document.getElementById("newEmpRole").value = user.role;

    document.getElementById("employeeFormTitle").scrollIntoView({
        behavior: "smooth"
    });
}


// ===============================
// 18. Start Change Password
// ===============================

function startChangePassword(username) {
    startEditUser(username);

    document.getElementById("employeeFormTitle").textContent = "Change Employee Password";
    document.getElementById("newEmpPassword").focus();
}


// ===============================
// 19. Save User Changes
// ===============================

function saveUserChanges() {
    const users = getUsers();
    const attendance = getAttendance();

    const user = users.find(function (item) {
        return item.username === editingUserUsername;
    });

    if (!user) {
        alert("User not found");
        return;
    }

    const oldUsername = user.username;

    const name = document.getElementById("newEmpName").value.trim();
    const username = document.getElementById("newEmpUsername").value.trim().toLowerCase();
    const code = document.getElementById("newEmpCode").value.trim();
    const password = document.getElementById("newEmpPassword").value.trim();
    const position = document.getElementById("newEmpPosition").value.trim();
    const department = document.getElementById("newEmpDept").value.trim();
    const manager = document.getElementById("newEmpManager").value.trim().toLowerCase();
    const branch = document.getElementById("newEmpBranch").value.trim();
    const role = document.getElementById("newEmpRole").value;

    if (!name || !username || !code || !position || !department || !branch || !role) {
        alert("Please fill all fields except password if you do not want to change it");
        return;
    }

    const usernameExists = users.some(function (item) {
        return item.username === username && item.username !== oldUsername;
    });

    if (usernameExists) {
        alert("Username already exists");
        return;
    }

    const codeExists = users.some(function (item) {
        return item.code.toLowerCase() === code.toLowerCase() && item.username !== oldUsername;
    });

    if (codeExists) {
        alert("Employee code already exists");
        return;
    }

    user.name = name;
    user.username = username;
    user.code = code;
    user.position = position;
    user.department = department;
    user.manager = manager || "-";
    user.branch = branch;
    user.role = role;

    if (password) {
        user.password = password;
    }

    attendance.forEach(function (record) {
        if (record.username === oldUsername) {
            record.username = username;
            record.employeeName = name;
            record.manager = user.manager;
        }

        if (record.manager === oldUsername) {
            record.manager = username;
        }
    });

    saveUsers(users);
    saveAttendance(attendance);

    const currentUser = getCurrentUser();

    if (currentUser && currentUser.username === oldUsername) {
        saveCurrentUser(user);
    }

    alert("User updated successfully");

    cancelUserEdit();
    loadAllEmployees();
    loadAdminReport();
}


// ===============================
// 20. Cancel User Edit
// ===============================

function cancelUserEdit() {
    editingUserUsername = null;

    document.getElementById("employeeFormTitle").textContent = "Add New Employee";
    document.getElementById("addEmployeeBtn").textContent = "Add Employee";
    document.getElementById("cancelUserEditBtn").classList.add("hidden");
    document.getElementById("newEmpPassword").placeholder = "Password";

    clearEmployeeForm();
}


// ===============================
// 21. Clear Employee Form
// ===============================

function clearEmployeeForm() {
    document.getElementById("newEmpName").value = "";
    document.getElementById("newEmpUsername").value = "";
    document.getElementById("newEmpCode").value = "";
    document.getElementById("newEmpPassword").value = "";
    document.getElementById("newEmpPosition").value = "";
    document.getElementById("newEmpDept").value = "";
    document.getElementById("newEmpManager").value = "";
    document.getElementById("newEmpBranch").value = "";
    document.getElementById("newEmpRole").value = "employee";
}


// ===============================
// 22. Delete Employee
// ===============================

function deleteEmployee(username) {
    const users = getUsers();

    const filteredUsers = users.filter(function (user) {
        return user.username !== username;
    });

    saveUsers(filteredUsers);

    alert("Employee deleted successfully");

    loadAllEmployees();
}


// ===============================
// 23. Load Admin Attendance Report
// ===============================

function loadAdminReport() {
    const tableBody = document.getElementById("adminReportTable");

    if (!tableBody) {
        return;
    }

    const attendance = getAttendance();

    tableBody.innerHTML = "";

    attendance.forEach(function (record) {
        tableBody.innerHTML += `
            <tr>
                <td>${record.employeeName}</td>
                <td>${record.date}</td>
                <td>${record.checkIn}</td>
                <td>${record.checkOut}</td>
                <td>${record.hours}</td>
                <td>${record.status}</td>
                <td>
                    <button class="main-btn small-btn" onclick="startEditReport(${record.id})">Edit</button>
                </td>
            </tr>
        `;
    });
}


// ===============================
// 24. Start Edit Report
// ===============================

function startEditReport(recordId) {
    const attendance = getAttendance();

    const record = attendance.find(function (item) {
        return item.id === recordId;
    });

    if (!record) {
        alert("Report record not found");
        return;
    }

    editingReportId = recordId;

    document.getElementById("editReportPanel").classList.remove("hidden");

    document.getElementById("editReportDate").value = record.date;
    document.getElementById("editReportCheckIn").value = record.checkIn;
    document.getElementById("editReportCheckOut").value = record.checkOut;
    document.getElementById("editReportHours").value = record.hours;
    document.getElementById("editReportStatus").value = record.status;

    document.getElementById("editReportPanel").scrollIntoView({
        behavior: "smooth"
    });
}


// ===============================
// 25. Save Report Changes
// ===============================

function saveReportChanges() {
    const attendance = getAttendance();

    const record = attendance.find(function (item) {
        return item.id === editingReportId;
    });

    if (!record) {
        alert("Report record not found");
        return;
    }

    const date = document.getElementById("editReportDate").value.trim();
    const checkIn = document.getElementById("editReportCheckIn").value.trim();
    const checkOut = document.getElementById("editReportCheckOut").value.trim();
    const hours = document.getElementById("editReportHours").value.trim();
    const status = document.getElementById("editReportStatus").value;

    if (!date || !checkIn || !checkOut || !hours || !status) {
        alert("Please fill all report fields");
        return;
    }

    record.date = date;
    record.checkIn = checkIn;
    record.checkOut = checkOut;
    record.hours = hours;
    record.status = status;

    saveAttendance(attendance);

    alert("Report updated successfully");

    cancelReportEdit();
    loadAdminReport();
    loadEmployeeReport();
    loadManagerReport();
}


// ===============================
// 26. Cancel Report Edit
// ===============================

function cancelReportEdit() {
    editingReportId = null;

    document.getElementById("editReportPanel").classList.add("hidden");

    document.getElementById("editReportDate").value = "";
    document.getElementById("editReportCheckIn").value = "";
    document.getElementById("editReportCheckOut").value = "";
    document.getElementById("editReportHours").value = "";
    document.getElementById("editReportStatus").value = "Pending";
}


// ===============================
// 27. Export CSV Function
// ===============================

function exportToCSV(records, fileName) {
    if (records.length === 0) {
        alert("No records to export");
        return;
    }

    let csvContent = "Employee,Date,Check In,Check Out,Hours,Status\n";

    records.forEach(function (record) {
        csvContent += `${record.employeeName},${record.date},${record.checkIn},${record.checkOut},${record.hours},${record.status}\n`;
    });

    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}


// ===============================
// 28. Export Employee Report
// ===============================

function exportEmployeeReport() {
    const currentUser = getCurrentUser();
    const attendance = getAttendance();

    const records = attendance.filter(function (record) {
        return record.username === currentUser.username;
    });

    exportToCSV(records, "employee-report.csv");
}


// ===============================
// 29. Export Manager Report
// ===============================

function exportManagerReport() {
    const currentUser = getCurrentUser();
    const attendance = getAttendance();

    const records = attendance.filter(function (record) {
        return record.manager.toLowerCase() === currentUser.username.toLowerCase();
    });

    exportToCSV(records, "manager-report.csv");
}


// ===============================
// 30. Export Admin Report
// ===============================

function exportAdminReport() {
    const attendance = getAttendance();

    exportToCSV(attendance, "admin-report.csv");
}


// ===============================
// 31. Event Listeners
// ===============================

document.addEventListener("DOMContentLoaded", function () {
    initDatabase();

    const currentUser = getCurrentUser();

    if (currentUser) {
        openDashboard(currentUser);
    }

    document.getElementById("loginBtn").addEventListener("click", login);

    document.getElementById("checkInBtn").addEventListener("click", checkIn);
    document.getElementById("checkOutBtn").addEventListener("click", checkOut);

    document.getElementById("empLogoutBtn").addEventListener("click", logout);
    document.getElementById("mgrLogoutBtn").addEventListener("click", logout);
    document.getElementById("adminLogoutBtn").addEventListener("click", logout);

    document.getElementById("addEmployeeBtn").addEventListener("click", addOrSaveEmployee);
    document.getElementById("cancelUserEditBtn").addEventListener("click", cancelUserEdit);

    document.getElementById("saveReportEditBtn").addEventListener("click", saveReportChanges);
    document.getElementById("cancelReportEditBtn").addEventListener("click", cancelReportEdit);

    document.getElementById("empExportBtn").addEventListener("click", exportEmployeeReport);
    document.getElementById("mgrExportBtn").addEventListener("click", exportManagerReport);
    document.getElementById("adminExportBtn").addEventListener("click", exportAdminReport);

    document.getElementById("appAlertClose").addEventListener("click", closeAppAlert);

    document.getElementById("appAlertOverlay").addEventListener("click", function (event) {
        if (event.target.id === "appAlertOverlay") {
            closeAppAlert();
        }
    });

    window.alert = function (message) {
        showAppAlert(message, "Notification");
    };
});