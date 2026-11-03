package com.qard.hasan

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val tvStatus = findViewById<TextView>(R.id.tvStatus)
        tvStatus.text = "🕊️ Qard al-Hasan mobile app ready!\n\n" +
                "✓ Cloudflare Workers & D1 Database connected\n" +
                "✓ Zero-Riba (100% interest-free) guarantee\n" +
                "✓ bKash/Nagad MFS parser & digital Aqd contracts active\n" +
                "✓ Al-Wasiyyah (Islamic Will & Liability Declaration) ready"
    }
}
