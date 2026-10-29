গওহরডাঙ্গা মাদরাসা — Facebook ডাউনলোড ফিক্স

1. ZIP Extract করুন।
2. GitHub-এ পুরোনো script.js-এর জায়গায় নতুন script.js দিন।
3. Code.gs আপনার Google Apps Script প্রজেক্টে বসান। SPREADSHEET_ID ও SHEET_NAME সঠিক আছে কি না যাচাই করুন।
4. Apps Script-এ Deploy > Manage deployments > Edit > New version > Deploy করুন। Web app access আপনার ব্যবহারের উপযোগী রাখুন এবং প্রয়োজন হলে অনুমতি দিন।
5. অস্থায়ী ছবি এক ঘণ্টা পরে মুছতে Apps Script-এ installImageCleanupTrigger ফাংশন একবার চালান।
6. Facebook-এ সাইট রিফ্রেশ করে আবার পরীক্ষা করুন।

এখন Drive লিংকটি টেক্সট বক্সে দেখা যাবে, “লিংক কপি করুন” বাটন থাকবে। Facebook clipboard আটকালে লিংক বক্সে সিলেক্ট করে কপি করুন। Google Drive আপলোড ব্যর্থ হলে Apps Script-এর Executions দেখুন।
