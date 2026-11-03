package com.qard.hasan

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val tvStatus = findViewById<TextView>(R.id.tvStatus)
        tvStatus.text = "🕊️ কর্জ্যে হাসানাহ (Qard al-Hasan) মোবাইল অ্যাপ প্রস্তুত!\n\n" +
                "✓ Cloudflare Workers & D1 Database সংযুক্ত\n" +
                "✓ Zero-Riba (শূন্য সুদ) নিশ্চিতকরণ\n" +
                "✓ বিকাশ/নগদ SMS পার্সার ও ডিজিটাল চুক্তিপত্র সক্রিয়\n" +
                "✓ আল-ওয়াসিয়্যাহ (অসিয়তনামা) মডিউল প্রস্তুত"
    }
}
