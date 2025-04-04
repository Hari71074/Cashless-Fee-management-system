// Import the functions you need from the SDKs you need

// This line should be here and uncommented
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // Commented out
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore"; // Import firestore functions

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


// ... your imports and Firebase config ...

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase App initialized:", app);

// Get Auth and Firestore instances using the Modular SDK syntax
const auth = getAuth(app);
console.log("Auth instance:", auth); // Keep this for debugging

const db = getFirestore(app); // Initialize db here

// document.addEventListener('DOMContentLoaded', () => { ... }); // Keep your DOMContentLoaded listener

document.addEventListener('DOMContentLoaded', () => {
  // --- Get references to frequently used HTML elements for LOGIN ---
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const userIdInputLogin = document.getElementById('userId'); // Assuming you're using 'userId' as email
  const passwordInput = document.getElementById('password');
  const showPasswordCheckbox = document.getElementById('showPassword');

  // LOGIN PAGE: Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (loginError) loginError.textContent = '';

      const email = userIdInputLogin ? userIdInputLogin.value : '';
      const password = passwordInput ? passwordInput.value : '';

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
          if (loginError) {
            if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
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

  // --- Get references to dashboard options and sections ---
  const fetchFeeDetailsButton = document.getElementById('fetch-fee-details-button');
  const addStudentButton = document.getElementById('add-student-button');
  const searchSection = document.getElementById('search-section');
  const addStudentSection = document.getElementById('add-student-section');
  const dashboardOptionsSection = document.getElementById('dashboard-options');

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

  // --- Get references to frequently used HTML elements for ADD STUDENT ---
  const addStudentForm = document.getElementById('add-student-form');
  const addStudentMessage = document.getElementById('add-student-message');

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
      const course = document.getElementById('course').value;
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
  const studentSearchForm = document.getElementById('student-search-form');
  const searchError = document.getElementById('search-error');
  const studentDetailsSection = document.getElementById('student-details-section');
  const studentInfoDiv = document.getElementById('student-info');
  const sStudentId = document.getElementById('s-studentId');
  const sName = document.getElementById('s-name');
  const sFathername = document.getElementById('s-fathername');
  const sMothername = document.getElementById('s-mothername');
  const sCourse = document.getElementById('s-course');
  const sMobile = document.getElementById('s-mobile');
  const sTotalfee = document.getElementById('s-totalfee');
  const sBalancefee = document.getElementById('s-balancefee');
  const backButton = document.getElementById('back-button');

  // FIND STUDENT FORM: Handle form submission
  if (studentSearchForm) {
    studentSearchForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (searchError) searchError.textContent = '';
      studentDetailsSection.classList.add('hidden'); // Hide previous results

      const studentId = document.getElementById('searchStudentId').value; // Using the new ID

      try {
        const docRef = doc(db, "students", studentId); // Using Modular SDK's doc
        const docSnap = await getDoc(docRef); // Using Modular SDK's getDoc

        if (docSnap.exists()) {
          const studentData = docSnap.data();
          console.log("Document data:", studentData);
          sStudentId.textContent = studentData.studentId;
          sName.textContent = studentData.name;
          sFathername.textContent = studentData.fathername;
          sMothername.textContent = studentData.mothername;
          sCourse.textContent = studentData.course;
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
      document.getElementById('student-search-form').reset();
      if (searchError) searchError.textContent = '';
    });
  }

  // --- Logout functionality ---
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      signOut(auth).then(() => { // Using Modular SDK's signOut
        console.log('Logged out successfully');
        window.location.href = 'index.html'; // Redirect to login page
      }).catch((error) => {
        console.error('Logout failed:', error);
      });
    });
  }
});