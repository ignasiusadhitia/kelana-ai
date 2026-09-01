# Sesi 9 Evaluation & Benchmarking: RAG vs. Base Model

Folder ini memuat seluruh aset pengujian otomatis, data mentah JSON, dan laporan evaluasi untuk **Tugas Sesi 9: Teaching KelanaAI to Read Knowledge**.

---

## 📁 Struktur File dalam Folder `evaluation/`:

* **`run_comparison.py`**: Script otomatis untuk mengeksekusi 5 pertanyaan benchmark terhadap **Base Model (Zero-Shot tanpa dokumen)** dan **KelanaAI RAG (Knowledge Base Verified)** menggunakan AWS Bedrock API (`amazon.nova-lite-v1:0`).
* **`RAG_VS_BASE_MODEL_COMPARISON.md`**: Dokumen laporan komprehensif berisi perbandingan **Output JSON Response**, analisis validitas, mitigasi halusinasi, dan metadata sitasi S3.
* **`rag_test_results.json`**: File data mentah JSON hasil uji request API secara *real-time*.

---

## 🚀 Cara Menjalankan Uji Banding Ulang:

1. Pastikan virtual environment Python aktif dan file `backend/.env` memuat kredensial AWS Bedrock yang valid.
2. Jalankan perintah berikut dari root proyek:
   ```bash
   cd evaluation
   ..\backend\.venv\Scripts\python.exe run_comparison.py
   ```
3. Script akan otomatis menguji ke-5 pertanyaan dan memperbarui file laporan `RAG_VS_BASE_MODEL_COMPARISON.md` dan `rag_test_results.json`.
