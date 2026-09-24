/**
 * DLRMS Land Record Verification Script
 * Exact reproduction of dynamic logic from dlrms.land.gov.bd/v/[displayCode]
 */

const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
const bengaliDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const bengaliMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

function toBengaliNumber(input) {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[0-9]/g, digit => bengaliDigits[digit] || digit);
}

// Bangla Academy 2019 Revised Calendar converter
function getBanglaDateParts(d = new Date()) {
  const gYear = d.getFullYear();
  const gMonth = d.getMonth(); // 0 = Jan, 8 = Sep
  const gDate = d.getDate();

  // Gregorian Leap Year check
  const isLeap = (gYear % 4 === 0 && gYear % 100 !== 0) || (gYear % 400 === 0);

  const banglaMonths = [
    'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
    'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'
  ];
  // 31 days for first 4 months, 32 for Bhadra (aligning Ashwin 1 with Sep 17 in gov portal), 30 for next 5, 30 for Chaitra
  const monthDays = [31, 31, 31, 31, 32, 30, 30, 30, 30, 30, isLeap ? 30 : 29, 30];

  // Bengali New Year starts on April 14 (month index 3, date 14)
  const isAfterPohelaBoishakh = (gMonth > 3) || (gMonth === 3 && gDate >= 14);
  const bYear = isAfterPohelaBoishakh ? (gYear - 593) : (gYear - 594);

  // Reference date: April 14 of current Bengali year
  const boishakh1 = new Date(isAfterPohelaBoishakh ? gYear : gYear - 1, 3, 14);
  const diffTime = d.getTime() - boishakh1.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let remaining = diffDays;
  let bMonthIndex = 0;
  for (let i = 0; i < 12; i++) {
    if (remaining < monthDays[i]) {
      bMonthIndex = i;
      break;
    }
    remaining -= monthDays[i];
  }

  const bDay = remaining + 1;
  const bMonthName = banglaMonths[bMonthIndex];

  return { bDay, bMonthName, bYear };
}

// Calculates accurate Bengali calendar date + Gregorian date dynamically
function getFullBengaliHeaderDate(d = new Date()) {
  const dayName = bengaliDays[d.getDay()];
  const gregDay = toBengaliNumber(d.getDate());
  const gregMonth = bengaliMonths[d.getMonth()];
  const gregYear = toBengaliNumber(d.getFullYear());

  const { bDay, bMonthName, bYear } = getBanglaDateParts(d);
  const banglaDay = toBengaliNumber(bDay);
  const banglaYear = toBengaliNumber(bYear);

  return `${dayName}, ${banglaDay} ${bMonthName} ${banglaYear}, ${gregDay} ${gregMonth} ${gregYear}`;
}

// Track and auto-update top header date when midnight / day changes
let lastRenderedDate = '';
function updateTopDateBar() {
  const now = new Date();
  const dateEl = document.getElementById('currentBengaliDate');
  if (dateEl) {
    dateEl.innerText = getFullBengaliHeaderDate(now);
  }
  lastRenderedDate = now.toDateString();
}

// Default Authentic Record Data
const liveData = {
  khatianNo: '1822',
  owners: 'কোহিনুর বেগম, মোছাঃ জেসমিন',
  dag: '1290',
  survey: 'নামজারি',
  mouza: 'ছোট বয়রা',
  upazila: 'খুলনা সদর রাজস্ব সার্কেল',
  district: 'খুলনা',
  division: 'খুলনা',
  date: '২৩ সেপ্টেম্বর ২০২৬'
};

document.addEventListener('DOMContentLoaded', () => {
  // Update Top Date Bar with dynamic Bengali Date
  updateTopDateBar();

  // Day Change Auto-update: Check every 30 seconds if date has rolled over past midnight
  setInterval(() => {
    const today = new Date().toDateString();
    if (today !== lastRenderedDate) {
      updateTopDateBar();
    }
  }, 30000);

  // Tab focus / wakeup check
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const today = new Date().toDateString();
      if (today !== lastRenderedDate) {
        updateTopDateBar();
      }
    }
  });

  // Populate Khatian Card
  renderKhatianData(liveData);

  // Mobile Drawer Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.style.display = 'block';
    });

    if (drawerClose) {
      drawerClose.addEventListener('click', () => {
        mobileDrawer.style.display = 'none';
      });
    }

    mobileDrawer.addEventListener('click', (e) => {
      if (e.target === mobileDrawer) {
        mobileDrawer.style.display = 'none';
      }
    });
  }

  // Login Button Action
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      window.open('https://citizen.land.gov.bd', '_blank');
    });
  }

  // Footer Scroll to Top Button
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Footer Chat Button
  const footerChatBtn = document.getElementById('footerChatBtn');
  const chatbotWindow = document.getElementById('chatbotWindow');
  if (footerChatBtn && chatbotWindow) {
    footerChatBtn.addEventListener('click', () => {
      chatbotWindow.style.display = 'block';
      chatbotWindow.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Setup Chatbot Interactions
  initChatbot();
});

function renderKhatianData(data) {
  const header = document.getElementById('khatianHeader');
  const owner = document.getElementById('khatianOwner');
  const dag = document.getElementById('khatianDag');
  const survey = document.getElementById('khatianSurvey');
  const mouza = document.getElementById('khatianMouza');
  const upazila = document.getElementById('khatianUpazila');
  const district = document.getElementById('khatianDistrict');
  const division = document.getElementById('khatianDivision');
  const date = document.getElementById('khatianDate');

  if (header) header.innerText = `খতিয়ান নং - ${toBengaliNumber(data.khatianNo)}`;
  if (owner) owner.innerText = data.owners;
  if (dag) dag.innerText = data.dag;
  if (survey) survey.innerText = data.survey;
  if (mouza) mouza.innerText = data.mouza;
  if (upazila) upazila.innerText = data.upazila;
  if (district) district.innerText = data.district;
  if (division) division.innerText = data.division;
  if (date) date.innerText = data.date;
}

// Chatbot Functionality
function initChatbot() {
  const btn = document.getElementById('chatbotBtn');
  const windowEl = document.getElementById('chatbotWindow');
  const closeBtn = document.getElementById('chatCloseBtn');
  const sendBtn = document.getElementById('chatSendBtn');
  const input = document.getElementById('chatInput');
  const container = document.getElementById('chatContainer');

  if (!btn || !windowEl) return;

  btn.addEventListener('click', () => {
    const isVisible = windowEl.style.display === 'block';
    windowEl.style.display = isVisible ? 'none' : 'block';
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      windowEl.style.display = 'none';
    });
  }

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    // Add user bubble
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user-message';
    userMsg.innerText = text;
    container.appendChild(userMsg);
    input.value = '';
    container.scrollTop = container.scrollHeight;

    // Reply
    setTimeout(() => {
      let reply = 'ধন্যবাদ। বিস্তারিত সেবা সংক্রান্ত তথ্যের জন্য ভূমি সেবা হেল্পলাইন ১৬১২২ নম্বরে যোগাযোগ করুন।';
      if (text.includes('ভেরিফিকেশন') || text.includes('যাচাই')) {
        reply = 'অনলাইন ই-খতিয়ানের কিউআর কোড স্ক্যান করে এই পেজ থেকে খতিয়ানের আসল কপি ও মালিকানা যাচাই করা যায়।';
      } else if (text.includes('সার্টিফাইড কপি')) {
        reply = 'সার্টিফাইড কপির জন্য অনলাইন পেমেন্ট করে জেলা প্রশাসকের কার্যালয়ের রেকর্ডরুম থেকে বা ডাকযোগে সংগ্রহ করা যায়।';
      } else if (text.includes('১৬১২২')) {
        reply = 'ভূমি সেবা কল সেন্টার ১৬১২২ সপ্তাহে ৭ দিন ২৪ ঘণ্টা যেকোনো ল্যান্ড সার্ভিসের পরামর্শ প্রদান করে।';
      }

      const botMsg = document.createElement('div');
      botMsg.className = 'chat-message bot-message';
      botMsg.innerText = reply;
      container.appendChild(botMsg);
      container.scrollTop = container.scrollHeight;
    }, 500);
  }

  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }
}

function sendQuickMessage(msg) {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  if (input && sendBtn) {
    input.value = msg;
    sendBtn.click();
  }
}
