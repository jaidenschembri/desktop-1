// --- Firebase Guestbook ---
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
  import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyB4gYXMt5cBXQc4v7-dSn81Nkzv4G82lkU",
    authDomain: "neocity-486f6.firebaseapp.com",
    projectId: "neocity-486f6",
    storageBucket: "neocity-486f6.appspot.com",
    messagingSenderId: "306365741510",
    appId: "1:306365741510:web:68919ebfa94e2eab279ac7",
    measurementId: "G-S63FZYBK5J"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const form = document.getElementById("guestbookForm");
  const entriesList = document.getElementById("entriesList");

  function loadEntries() {
    const guestbookRef = collection(db, "guestbook");

    onSnapshot(guestbookRef, (snapshot) => {
      entriesList.innerHTML = "";
      snapshot.forEach((doc) => {
        const entry = doc.data();
        const listItem = document.createElement("li");
        listItem.innerHTML = `<strong>${entry.name}:</strong> ${entry.message}`;
        entriesList.appendChild(listItem);
      });
    });
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = document.getElementById("name").value.trim();
      const message = document.getElementById("message").value.trim();
      if (!name || !message) return;

      try {
        await addDoc(collection(db, "guestbook"), {
          name,
          message,
          timestamp: serverTimestamp()
        });
        form.reset();
      } catch (error) {
        console.error("Error adding message:", error);
      }
    });
  }

  loadEntries();