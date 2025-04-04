// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; // Import updateDoc

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCkTBWZvm3gAH1njiSHYEPrZUJmF_DBT4c",
    authDomain: "cashless-fee-payment.firebaseapp.com",
    projectId: "cashless-fee-payment",
    storageBucket: "cashless-fee-payment.firebasestorage.app",
    messagingSenderId: "528515335884",
    appId: "1:528515335884:web:3002a89c90844e960b2469",
    measurementId: "G-QEXM6Q5WG1"
};
console.log("AIzaSyCkTBWZvm3gAH1njiSHYEPrZUJmF_DBT4c:", firebaseConfig.apiKey);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase App initialized:", app);

// Get Auth and Firestore instances using the Modular SDK syntax
const auth = getAuth(app);
console.log("Auth instance:", auth);

const db = getFirestore(app); // Initialize db here

document.addEventListener('DOMContentLoaded', () => {
  // --- Get references to frequently used HTML elements ---
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const userIdInputLogin = document.getElementById('userId');
  const passwordInput = document.getElementById('password');
  const showPasswordCheckbox = document.getElementById('showPassword');
  const fetchFeeDetailsButton = document.getElementById('fetch-fee-details-button');
  const addStudentButton = document.getElementById('add-student-button');
  const searchSection = document.getElementById('search-section');
  const addStudentSection = document.getElementById('add-student-section');
  const dashboardOptionsSection = document.getElementById('dashboard-options');
  const addStudentForm = document.getElementById('add-student-form');
  const addStudentMessage = document.getElementById('add-student-message');
  const studentSearchForm = document.getElementById('student-search-form');
  const searchError = document.getElementById('search-error');
  const studentDetailsSection = document.getElementById('student-details-section');
  const sStudentId = document.getElementById('s-studentId');
  const sName = document.getElementById('s-name');
  const sFathername = document.getElementById('s-fathername');
  const sMothername = document.getElementById('s-mothername');
  const sCourse = document.getElementById('s-course');
  const sYear = document.getElementById('s-year');
  const sMobile = document.getElementById('s-mobile');
  const sTotalfee = document.getElementById('s-totalfee');
  const sBalancefee = document.getElementById('s-balancefee');
  const backButton = document.getElementById('back-button');
  const receiptSection = document.getElementById('receipt-section');
  const receiptContent = document.getElementById('receipt-content');
  const printReceiptButton = document.getElementById('print-receipt-button');
  const dashboardHomeButton = document.getElementById('dashboard-home-button');
  const logoutButton = document.getElementById('logout-button');
  const payFeeButton = document.getElementById('pay-fee-button');
  const paymentAmountInput = document.getElementById('paymentAmount');
  const courseInputAdd = document.getElementById('course');
  const yearInputAdd = document.getElementById('year');
  const receiptStudentCourse = document.getElementById('receipt-student-course');
  const receiptStudentYear = document.getElementById('receipt-student-year');

  let loggedInStaffEmail = null;

  // Get the currently logged-in staff member's email
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loggedInStaffEmail = user.email;
    } else {
      loggedInStaffEmail = null;
    }
  });

  // LOGIN PAGE: Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (loginError) loginError.textContent = '';

      const email = userIdInputLogin ? userIdInputLogin.value : '';
      const password = passwordInput ? passwordInput.value : '';

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (loginError) loginError.textContent = 'Invalid User ID format.';
        return; // Stop the login attempt
      }

      console.log("Login attempt:", email, password); // Added for debugging

      signInWithEmailAndPassword(auth, email, password) // Using Modular SDK's signInWithEmailAndPassword
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log('Login Success!', user);
          window.location.href = 'staff_dashboard.html'; // Redirect to dashboard
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error('Login Failed:', errorCode, errorMessage);
          console.log("Full Error Object:", error); // Make sure this line is present
          if (loginError) {
            if (errorCode === 'auth/wrong-password') {
              loginError.textContent = 'Incorrect Password.';
            } else if (errorCode === 'auth/user-not-found') {
              loginError.textContent = 'Incorrect User ID.';
            } else if (errorCode === 'auth/invalid-credential') {
              loginError.textContent = 'Invalid User ID or Password.';
            } else {
              loginError.textContent = 'An error occurred during login.';
            }
          }
        });
    });
  }

  // --- Toggle password visibility ---
  if (showPasswordCheckbox && passwordInput) {
    showPasswordCheckbox.addEventListener('change', () => {
      passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
    });
  }

  // --- Event listeners for dashboard options ---
  if (fetchFeeDetailsButton) {
    fetchFeeDetailsButton.addEventListener('click', () => {
      dashboardOptionsSection.classList.add('hidden');
      searchSection.classList.remove('hidden');
      addStudentSection.classList.add('hidden');
    });
  }

  if (addStudentButton) {
    addStudentButton.addEventListener('click', () => {
      dashboardOptionsSection.classList.add('hidden');
      addStudentSection.classList.remove('hidden');
      searchSection.classList.add('hidden');
    });
  }

  // ADD STUDENT FORM: Handle form submission
  if (addStudentForm) {
    addStudentForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (addStudentMessage) addStudentMessage.textContent = '';

      const studentId = document.getElementById('studentId').value;
      const name = document.getElementById('name').value;
      const fathername = document.getElementById('fathername').value;
      const mothername = document.getElementById('mothername').value;
      const mobilenumber = document.getElementById('mobilenumber').value;
      const course = courseInputAdd.value;
      const year = yearInputAdd.value;
      const totalfee = parseFloat(document.getElementById('totalfee').value);
      const balancefee = parseFloat(document.getElementById('balancefee').value);

      if (!studentId.trim()) {
        if (addStudentMessage) addStudentMessage.textContent = 'Student ID cannot be empty.';
        return; // Stop the function execution if Student ID is empty
      }

      console.log("Firestore instance (db):", db); // Added for debugging

      try {
        await setDoc(doc(db, "students", studentId), { // Using Modular SDK's setDoc and doc
          studentId: studentId,
          name: name,
          fathername: fathername,
          mothername: mothername,
          mobilenumber: mobilenumber,
          course: course,
          year: year,
          totalfee: totalfee,
          balancefee: balancefee
        });
        console.log("Document written with ID: ", studentId);
        if (addStudentMessage) addStudentMessage.textContent = 'Student data added successfully!';
        addStudentForm.reset();
      } catch (error) {
        console.error("Error adding document: ", error);
        if (addStudentMessage) addStudentMessage.textContent = 'Error adding student data.';
      }
    });
  }

  // --- Get references to frequently used HTML elements for FIND STUDENT ---
  if (studentSearchForm) {
    studentSearchForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (searchError) searchError.textContent = '';
      studentDetailsSection.classList.add('hidden');
      receiptSection.classList.add('hidden');

      const studentId = document.getElementById('searchStudentId').value;

      try {
        const docRef = doc(db, "students", studentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const studentData = docSnap.data();
          console.log("Document data:", studentData);
          sStudentId.textContent = studentData.studentId;
          sName.textContent = studentData.name;
          sFathername.textContent = studentData.fathername;
          sMothername.textContent = studentData.mothername;
          sCourse.textContent = studentData.course;
          sYear.textContent = studentData.year;
          sMobile.textContent = studentData.mobilenumber;
          sTotalfee.textContent = studentData.totalfee;
          sBalancefee.textContent = studentData.balancefee;
          studentDetailsSection.classList.remove('hidden');
        } else {
          console.log("No such document!");
          if (searchError) searchError.textContent = 'No student found with that ID.';
        }
      } catch (error) {
        console.error("Error getting document:", error);
        if (searchError) searchError.textContent = 'Error fetching student details.';
      }
    });
  }

  // Handle Back to Search button
  if (backButton) {
    backButton.addEventListener('click', () => {
      studentDetailsSection.classList.add('hidden');
      receiptSection.classList.add('hidden');
      document.getElementById('student-search-form').reset();
      if (searchError) searchError.textContent = '';
    });
  }

  // --- Logout functionality ---
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      signOut(auth).then(() => {
        console.log('Logged out successfully');
        window.location.href = 'index.html';
      }).catch((error) => {
        console.error('Logout failed:', error);
      });
    });
  }

  // --- Razorpay Payment Integration ---
  if (payFeeButton) {
    payFeeButton.addEventListener('click', async () => {
      const studentId = document.getElementById('s-studentId').textContent;
      const name = document.getElementById('s-name').textContent;
      const totalfee = parseFloat(document.getElementById('s-totalfee').textContent);
      const currentBalance = parseFloat(document.getElementById('s-balancefee').textContent);
      const course = document.getElementById('s-course').textContent;
      const year = document.getElementById('s-year').textContent;
      const amountToPay = parseFloat(paymentAmountInput.value);

      if (isNaN(amountToPay) || amountToPay <= 0) {
        alert("Please enter a valid amount to pay.");
        return;
      }

      if (amountToPay > currentBalance) {
        alert("Amount to pay cannot be greater than the balance fee.");
        return;
      }

      var options = {
        "key": "rzp_test_KhfNnpQCnlC75Z",
        "amount": amountToPay * 100, // Amount in paise
        "currency": "INR",
        "name": "Sri Venkateshwara Engineering College",
        "description": "Fee Payment for Student ID: " + studentId,
        "image": "URL_TO_YOUR_INSTITUTION_LOGO",
        "order_id": "",
        "handler": async function (response) {
          const paymentId = response.razorpay_payment_id;
          const paymentDateTime = new Date().toLocaleString('en-IN');
          const paymentMethod = "Razorpay";
          const staff = loggedInStaffEmail || "N/A"; // Get staff email or default
          const remainingBalance = currentBalance - amountToPay;

          // Populate receipt content
          document.getElementById('receipt-student-id').textContent = studentId;
          document.getElementById('receipt-student-name').textContent = name;
          receiptStudentCourse.textContent = course;
          receiptStudentYear.textContent = year;
          document.getElementById('receipt-payment-id').textContent = paymentId;
          document.getElementById('receipt-payment-datetime').textContent = paymentDateTime;
          document.getElementById('receipt-payment-method').textContent = paymentMethod;
          document.getElementById('receipt-staff').textContent = staff;
          document.getElementById('receipt-total-fee').textContent = totalfee;
          document.getElementById('receipt-amount-paid').textContent = amountToPay;
          document.getElementById('receipt-balance-remaining').textContent = remainingBalance;

          receiptSection.classList.remove('hidden');
          studentDetailsSection.classList.add('hidden');

          // Update balance in Firestore
          try {
            const studentDocRef = doc(db, "students", studentId);
            await updateDoc(studentDocRef, {
              balancefee: remainingBalance
            });
            console.log("Balance updated successfully for student ID:", studentId);
            // Update displayed balance on student details section
            document.getElementById('s-balancefee').textContent = remainingBalance;
          } catch (error) {
            console.error("Error updating balance:", error);
          }
        },
        "prefill": {
          "name": name,
        },
        "notes": {
          "student_id": studentId,
          "course": course,
          "year": year
        },
        "theme": {
          "color": "#3399cc"
        }
      };
      var rzp1 = new Razorpay(options);
      console.log("Opening Razorpay checkout..."); // Add this line here
      rzp1.open();
    });
  }

  // --- Print Receipt Functionality (Generate PDF) ---
  if (printReceiptButton) {
    printReceiptButton.addEventListener('click', () => {
      const receiptContentDiv = document.getElementById('receipt-content');

      if (typeof jspdf !== 'undefined' && typeof jspdf.jsPDF !== 'undefined') {
        const pdf = new jspdf.jsPDF();
        const margin = 10;
        const yStart = 20;
        let y = yStart;

        pdf.setFontSize(16);
        pdf.text("Payment Receipt", margin, y);
        y += 10;
        pdf.setFontSize(12);

        // Function to add text with line breaks
        function addWrappedText(pdf, text, x, y, maxWidth, lineHeight) {
          const words = text.split(' ');
          let line = '';
          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = pdf.getTextDimensions(testLine);
            if (metrics.width > maxWidth && i > 0) {
              pdf.text(line, x, y);
              y += lineHeight;
              line = words[i] + ' ';
            } else {
              line = testLine;
            }
          }
          pdf.text(line, x, y);
          return y;
        }

        const receiptDetails = {
          "Student ID:": document.getElementById('receipt-student-id').textContent,
          "Name:": document.getElementById('receipt-student-name').textContent,
          "Course:": receiptStudentCourse.textContent,
          "Year:": receiptStudentYear.textContent,
          "Payment ID:": document.getElementById('receipt-payment-id').textContent,
          "Payment Date & Time:": document.getElementById('receipt-payment-datetime').textContent,
          "Payment Method:": document.getElementById('receipt-payment-method').textContent,
          "Staff:": document.getElementById('receipt-staff').textContent,
          "Total Fee:": document.getElementById('receipt-total-fee').textContent,
          "Amount Paid:": document.getElementById('receipt-amount-paid').textContent,
          "Balance Remaining:": document.getElementById('receipt-balance-remaining').textContent,
          "Thank you for your payment!": ""
        };

        let currentY = yStart + 20;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const availableWidth = pageWidth - 2 * margin;
        const lineHeight = 5;

        for (const key in receiptDetails) {
          const text = `${key} ${receiptDetails[key]}`;
          currentY = addWrappedText(pdf, text, margin, currentY, availableWidth, lineHeight) + lineHeight;
        }


        pdf.save(`receipt_${document.getElementById('receipt-student-id').textContent}.pdf`);
      } else {
        alert("jsPDF library not found. Please include it in your HTML to generate PDF receipts.");
      }
    });
  }

  // Go Back to Search button
  if (dashboardHomeButton) {
    dashboardHomeButton.addEventListener('click', () => {
      receiptSection.classList.add('hidden');
      document.getElementById('student-search-form').reset();
      if (searchError) searchError.textContent = '';
      document.getElementById('dashboard-options').classList.remove('hidden');
      studentDetailsSection.classList.add('hidden'); // Ensure student details are also hidden
    });
  }
});