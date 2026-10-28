গওহর মাদ্রাসা প্রোফাইল সাইট — Facebook ডাউনলোড ফিক্স

এই ZIP-এ আছে:
- script.js: আপডেট করা JavaScript ফাইল

কী পরিবর্তন হয়েছে:
- Facebook/Instagram-এর in-app browser শনাক্ত হলে আর শুধু স্বয়ংক্রিয় download-এর উপর নির্ভর করে না।
- ডাউনলোড বাটনে চাপলে সঙ্গে সঙ্গে “ছবি খুলুন / সেভ করুন” লিংক দেখায়।
- Google Drive-এ অস্থায়ী আপলোড সফল হলে আলাদা Drive লিংকও দেখানোর চেষ্টা করে।
- Chrome/সাধারণ ব্রাউজারে আগের মতো ডাউনলোডের চেষ্টা করে।

গুরুত্বপূর্ণ:
- এই ZIP-এ HTML, CSS, assets/profile-frame.png বা Google Apps Script (Code.gs) নেই; আপনার দেওয়া script.js থেকে শুধু JavaScript আপডেট করা হয়েছে।
- GitHub রিপোজিটরির আগের script.js-এর বদলে এই ফাইলটি দিন।
- Google Apps Script URL একই রাখা হয়েছে। Drive লিংক না এলে Apps Script Web App deployment, permissions এবং uploadImage handler পরীক্ষা করতে হবে।
- Facebook-এর ব্রাউজারের সীমাবদ্ধতার কারণে সব ফোনে সরাসরি ডাউনলোড নিশ্চিত করা যায় না; “ছবি খুলুন / সেভ করুন” লিংকটি বিকল্প পথ।
