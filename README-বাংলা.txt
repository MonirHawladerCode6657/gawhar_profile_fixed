গওহরডাঙ্গা মাদরাসা — Facebook ব্রাউজার ডাউনলোড ও Google Drive প্রিভিউ

এই প্যাকেজে আপডেট করা index.html, script.js, style.css এবং Google Apps Script Code.gs আছে।

GitHub Pages-এ বসানোর নিয়ম
1. ZIP Extract করুন।
2. আপনার GitHub repository-তে index.html, script.js ও style.css ফাইলগুলো প্রতিস্থাপন করুন।
3. আপনার আগের assets/ এবং fonts/ ফোল্ডারগুলো repository-তে রাখবেন। এই ZIP-এ সেগুলো নেই, কারণ সেগুলো এই আপলোডে দেওয়া হয়নি।
4. Code.gs-এর কোডটি Google Apps Script প্রজেক্টে বসান। SPREADSHEET_ID ও SHEET_NAME নিজের সঠিক মানে রাখুন।
5. Apps Script > Deploy > Manage deployments > Edit > New version > Deploy করুন। Web app access ঠিকভাবে সেট করুন এবং প্রয়োজনে অনুমতি দিন।
6. Apps Script-এ installImageCleanupTrigger ফাংশন একবার চালালে অস্থায়ী ছবি মুছে ফেলার ট্রিগার চালু হবে।
7. GitHub Pages-এ সাইট রিফ্রেশ করে ছবি তৈরি ও পরীক্ষা করুন।

নতুন সুবিধা
- Google Drive-এ আপলোড হওয়া ছবির প্রিভিউ ওয়েবসাইটেই দেখাবে।
- Google Drive থেকে সরাসরি ডাউনলোড করার লিংক থাকবে।
- “লিংক কপি করুন” এবং “লিংক খুলুন” বাটন থাকবে।
- Facebook-এর ইন-অ্যাপ ব্রাউজারে clipboard কাজ না করলে লিংক বক্সে URL সিলেক্ট করে কপি করা যাবে।
- “আবার শুরু করুন” চাপলে আগের Google Drive প্রিভিউ ও লিংক UI লুকিয়ে যাবে।

গুরুত্বপূর্ণ
- Facebook অ্যাপের ভিতরে ওয়েবসাইট থেকে সরাসরি Facebook profile photo পরিবর্তন করা যায় না। ছবি ডাউনলোড/সেভ করে Facebook-এর profile photo অপশনে নিজে সেট করতে হবে।
- Google Drive preview দেখাতে Apps Script deployment-এর permission এবং Drive file sharing ঠিক থাকতে হবে।
- Google Drive upload ব্যর্থ হলে Apps Script-এর Executions লগ দেখুন।
