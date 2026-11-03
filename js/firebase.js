import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import { getDatabase, ref, onValue, query, limitToLast } from
    "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD43gyt50sHCFgVeeaeaeSsXPSKOLoIUM8",
  authDomain: "sistema-de-seguranca-iot.firebaseapp.com",
  databaseURL: "https://sistema-de-seguranca-iot-default-rtdb.firebaseio.com",
  projectId: "sistema-de-seguranca-iot",
  storageBucket: "sistema-de-seguranca-iot.firebasestorage.app",
  messagingSenderId: "548741088091",
  appId: "1:548741088091:web:11032764af79667f81907e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, query, limitToLast };
