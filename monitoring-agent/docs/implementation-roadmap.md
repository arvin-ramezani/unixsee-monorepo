# **The Implementation Roadmap**

1. **Phase 1: Environment Setup & Project Initialization** (Creating the lightweight, strict ESM TypeScript baseline).
2. **Phase 2: Host Identity & Discovery Core** (Extracting `/etc/machine-id` and parsing DirectAdmin configuration structures).
3. **Phase 3: High-Performance Metric Extraction** (Building non-blocking streams for `/proc` and parsing the LiteSpeed `.rtreport`).
4. **Phase 4: Local Aggregation & Ingestion Engine** (Engineering the 60-second rolling memory buffer and secure outbound HTTPS push).
5. **Phase 5: Cryptographic Security & CSF** (Implementing HMAC-SHA256 payload signing for backend verification).
