গওহরডাঙ্গা মাদ্রাসা প্রোফাইল পিক — সেটআপ নির্দেশিকা

ফোল্ডারে যা আছে
- index.html : ওয়েবসাইটের HTML
- style.css : ডিজাইন
- script.js : প্রোফাইল তৈরি, Google Sheet submit, PNG download এবং Drive upload
- Code.gs : Google Apps Script (এটি Apps Script editor-এ পেস্ট করবেন)

গুরুত্বপূর্ণ: HTML, CSS, browser JavaScript এবং Apps Script এক ফাইলে রাখবেন না। এগুলো আলাদা ফাইলে রাখতে হবে।

লিংক কোথায় পরিবর্তন করবেন
[LINK-১] script.js-এর GOOGLE_SCRIPT_URL:
https://script.google.com/macros/s/AKfycbw4HAMDV1AE5mIpOYKs-Ep9aEmejJ0CQQYycYWqVI0e0Gzx3-1a7qno6i6NBCw4pVJX/exec
আপনি Apps Script নতুন Web App deployment করলে নতুন URL পেলে এখানে বদলাবেন। এই এক URL-ই Google Sheet submit এবং image upload—দুই কাজেই ব্যবহৃত হয়।

[LINK-২] Code.gs-এর SPREADSHEET_ID:
11p5dfCj3CNbgBa6sXwrEadawOH-E3dTz4shI10cb_bY
অন্য Google Sheet ব্যবহার করলে শুধু Sheet URL-এর /d/ এবং /edit-এর মাঝের ID এখানে বসাবেন। একই শিট হলে বদলাবেন না।

[LINK-৩] index.html-এর Facebook Follow href:
https://www.facebook.com/share/1A2LrEtpX6/
নিজের পেজ/লিংক হলে পরিবর্তন করুন।

[LINK-৪] index.html-এর YouTube href:
https://youtube.com/@gawharmediaofficial?si=C8CGwPa1Oh84qgrJ
নিজের চ্যানেল URL হলে পরিবর্তন করুন।

আরও যেসব ফাইল/পথ ঠিক থাকতে হবে
- assets/profile-frame.png
- assets/মাদরাসার লোগু নিউ-01.png
- assets/মাহফিল পোস্টার-20.png
- fonts/SolaimanLipi_22-02-2012.ttf

Google Apps Script চালু করা
1. Code.gs-এর সম্পূর্ণ কোড Apps Script project-এ পেস্ট করে Save করুন।
2. Deploy > New deployment > Web app নির্বাচন করুন।
3. Execute as: Me নির্বাচন করুন।
4. Who has access: Anyone নির্বাচন করুন (পাবলিক সাইট থেকে submit করার জন্য প্রয়োজন; আপনার প্রতিষ্ঠানের নীতির সঙ্গে মিলিয়ে নিন)।
5. Deploy করে পাওয়া /exec URL script.js-এর GOOGLE_SCRIPT_URL-এ বসান।
6. Apps Script editor-এ installImageCleanupTrigger ফাংশন নির্বাচন করে Run করুন; প্রথমবার permission চাইলে অনুমতি দিন।
7. প্রতিবার Apps Script-এর কোড বদলালে Manage deployments > Edit > New version > Deploy করুন।

এক ঘণ্টা মেয়াদ
ফাইলের মেয়াদ এক ঘণ্টা; cleanup trigger প্রতি ৫ মিনিটে চলে বলে এক ঘণ্টা পার হওয়ার পর প্রায় ০–৫ মিনিটের মধ্যে ট্র্যাশে পাঠানো হবে। এটি Drive-এর Trash-এ যায়, সঙ্গে সঙ্গে স্থায়ীভাবে মুছে যায় না।

পরীক্ষা
- আগে সাধারণ ব্রাউজারে ছোট ছবি দিয়ে প্রোফাইল তৈরি ও ডাউনলোড পরীক্ষা করুন।
- এরপর Drive লিংক তৈরি হচ্ছে কি না পরীক্ষা করুন।
- সবশেষে Facebook/Instagram in-app browser-এ পরীক্ষা করুন।
- Apps Script-এর HTML iframe postMessage আচরণ ব্রাউজারভেদে আলাদা হতে পারে; কোনো উত্তর না এলে Apps Script Executions-এ error দেখুন।
- Base64 PNG খুব বড় হলে upload ব্যর্থ হতে পারে; ছোট ছবিতে পরীক্ষা করুন।
